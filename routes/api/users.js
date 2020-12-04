const express = require('express');
const router = express.Router();
const {body,validationResult} = require('express-validator')
const userModel = require('../../models/User')
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const config = require('config')


//@route    Post api/users
//desc      Register user
//access    Public
router.post('/',[
    body('name','Name is required').not().isEmpty(),
    body('email','Please enter a valid email').isEmail(),
    body('password','Please enter a password with 6 or more characters').isLength({min:6})
],async(req,res)=>{
    console.log(req.body)
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    try{
        //check if user exists
        const {name,email,password} = req.body;
        let user = await userModel.findOne({email})
            if(user){
                res.status(400).json({errors:[{msg:'User already exists'}]});
            }
        //get gravatar for users
        const avatar = gravatar.url(email,{
            s:'200',
            r:'pg',
            d:'mm'
        })
        user = new userModel({
            name,
            email,
            password,
            avatar
        })
        //encrypt password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password,salt);

        await user.save()

        //return jwtwebtoken
        const payload = {
            user:{
                id: user.id
            }
        }
        jwt.sign(payload,config.get('jwtSecret'),{expiresIn:360000},(err,token)=>{
            if(err) throw err
            res.send({token})
        })
    }catch(error){
        console.log(error.message)
        res.status(500).send('Server error...!')
    }
});

module.exports = router