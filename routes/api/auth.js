const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const userModel = require('../../models/User');
const bcrypt = require('bcryptjs')
const {body,validationResult} = require('express-validator')
const jwt = require('jsonwebtoken');
const config = require('config')

//@route    Get api/auth
//desc      Test route
//access    Public
router.get('/',auth,async(req,res)=> {
    try {
        const user = await userModel.findById(req.user.id).select('-password')
        res.send(user)
    } catch (err) {
        res.status(500).json({msg:'Server error'})
    }
});
//@route    Post api/users
//desc      Login user
//access    Public
router.post('/',[
    body('email','Please enter a valid email').isEmail(),
    body('password','Password required').exists()
],async(req,res)=>{
    console.log(req.body)
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    try{
        //check if user exists
        const {email,password} = req.body;
        let user = await userModel.findOne({email})
            if(!user){
                res.status(400).json({errors:[{msg:'Invalid credentials'}]});
            }
        //decrypt password
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            res.status(400).json({errors:[{msg:'Invalid credentials'}]});
        }
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