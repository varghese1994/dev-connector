const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const {body,validationResult} = require('express-validator')

//models
const profileModel = require('../../models/Profile');
const userModel = require('../../models/User');

const { json, response } = require('express');
const Profile = require('../../models/Profile');
const request = require('request');
const config = require('config')

//@route    Get api/profile/me
//desc      get current user profile
//access    Private
router.get('/me',auth,async(req,res)=>{
    try {
        const profile = await profileModel.findOne({user: req.user.id}).populate('user',['name','avatar']);
        if(!profile){
            res.status(400).json({msg:'There is no profile for this user'})
        }
        res.json(profile)
    } catch (err) {
        res.status(500).send('Server error')
    }
});
//@route    Post api/profile
//desc      Create or update user profile
//access    Private
router.post('/',[auth,[
    body('status','Status is required').not().isEmpty(),
    body('skills','Skills is required').not().isEmpty()
]],async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.status(400).json({errors: errors.array()})
    }
    const {
        company,website,location,bio,status,githubusername,skills,youtube,facebook,twitter,instagram,linkedin
    } = req.body
    //build profile object
    const profileFields = {}
    profileFields.user = req.user.id
    if(company) profileFields.company = company
    if(website) profileFields.website = website
    if(location) profileFields.location = location
    if(bio) profileFields.bio = bio
    if(status) profileFields.status = status
    if(githubusername) profileFields.githubusername = githubusername
    if(skills){
        profileFields.skills = skills.split(',').map(skill => skill.trim())
    }
    //build social object
    profileFields.social = {}
    if(youtube) profileFields.social.youtube = youtube
    if(twitter) profileFields.social.twitter = twitter
    if(facebook) profileFields.social.facebook = facebook
    if(linkedin) profileFields.social.linkedin = linkedin
    if(instagram) profileFields.social.instagram = instagram
    
    try {
        let profile = await profileModel.findOne({user: req.user._id})
        if(profile){
            //update
            profile = await profileModel.findByIdAndUpdate({user: req.user._id},{$set: profileFields},{new: true})
            return res.json(Profile)
        }
        //create
        profile = new profileModel(profileFields)
        await profile.save()
        res.json(profile)
    } catch (err) {
        console.log(err.message)
        res.status(500).send('Server error')
    }
})
//@route    Get api/profile
//desc      Get all profile
//access    Public
router.get('/',async(req,res)=>{
    try {
        const profiles = await profileModel.find().populate('user',['name','avatar'])
        res.json(profiles);
    } catch (err) {
        console.log(err.message)
        res.status(500).send('Server error')
    }
})
//@route    Get api/profile/user/:user_id
//desc      Get profile by user ID
//access    Public
router.get('/user/:user_id',async(req,res)=>{
    try {
        const profile = await profileModel.findOne({user: req.params.user_id}).populate('user',['name','avatar'])
        if(!profile){
            res.status(400).json({msg:'Profile not found!'})
        }
        res.json(profile);
    } catch (err) {
        console.log(err.message)
        if(err.kind = 'ObjectID'){
            res.status(400).json({msg:'Profile not found!'})
        }
        res.status(500).send('Server error')
    }
})
//@route    Delete api/profile
//desc      Delete user,profile,post
//access    Private
router.delete('/',auth,async(req,res)=>{
    try {
        //remove profile
        await profileModel.findOneAndRemove({user: req.user.id})
        //remove user
        await userModel.findOneAndRemove({_id: req.user.id})
        res.json({msg:'User deleted'})
    } catch (err) {
        console.log(err.message)
        res.status(500).send('Server error')
    }
})
//@route    Put api/profile/experience
//desc      Add profile experience
//access    Private
router.put('/experience',[auth,[
    body('title','Title is required').not().isEmpty(),
    body('company','Company is required').not().isEmpty(),
    body('from','From date is required').not().isEmpty()

]],async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    const {title,company,location,from,to,current,description} = req.body;
    const newExp = {
        title,company,location,from,to,current,description
    }
    //get profile
    try {
        const profile = await profileModel.findOne({user: req.user.id})
        profile.experience.unshift(newExp)
        await profile.save()
        res.json(profile)
    } catch (err) {
        console.log(err.message)
        res.send('Server error')
    }
})
//@route    Delete api/profile/experience/exp_id
//desc      Delete profile experience
//access    Private
router.delete('/experience/:exp_id',auth,async(req,res)=>{
    try {
        const profile = await profileModel.findOne({user: req.user.id})
        //get remove index
        const removeIndex = await profile.experience.map(item=> item.id).indexOf(req.params.exp_id);
        profile.experience.splice(removeIndex,1);
        await profile.save()
        res.json(profile)
    } catch (err) {
        console.log(err.message)
        res.status(500).send('Server error')
    }
})
//@route    Put api/profile/education
//desc      Add profile education
//access    Private
router.put('/education',[auth,[
    body('school','School is required').not().isEmpty(),
    body('degree','Degree is required').not().isEmpty(),
    body('fieldofstudy','Field of study is required').not().isEmpty(),
    body('from','From date is required').not().isEmpty()

]],async(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    const {school,degree,fieldofstudy,from,to,current,description} = req.body;
    const newEdu = {
        school,degree,fieldofstudy,from,to,current,description
    }
    //get profile
    try {
        const profile = await profileModel.findOne({user: req.user.id})
        profile.education.unshift(newEdu)
        await profile.save()
        res.json(profile)
    } catch (err) {
        console.log(err.message)
        res.send('Server error')
    }
})
//@route    Delete api/profile/eduction/edu_id
//desc      Delete profile education
//access    Private
router.delete('/education/:edu_id',auth,async(req,res)=>{
    try {
        const profile = await profileModel.findOne({user: req.user.id})
        //get remove index
        const removeIndex = await profile.education.map(item=> item.id).indexOf(req.params.edu_id);
        profile.education.splice(removeIndex,1);
        await profile.save()
        res.json(profile)
    } catch (err) {
        console.log(err.message)
        res.status(500).send('Server error')
    }
})
//@route    Get api/profile/github/:username
//desc      Get user repos from github 
//access    Piblic
router.get('/github/:username',(req,res)=>{
    try {
        const options = {
            uri:`https://api.github.com/users/${req.params.username}/repos?per_page=5&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
            method:'GET',
            headers:{'user-agent':'node.js'}
        }
        request(options,(error,response,body)=>{
            if(error) console.error(error)
            if(response.statusCode !== 200){
                res.status(404).json({msg:'No github profile found'})
            }
            res.json(JSON.parse(body))
        })
    } catch (err) {
        console.log(err.message)
        res.status(500).send('Server error')
    }
})
module.exports = router