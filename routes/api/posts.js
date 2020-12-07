const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const {body,validationResult} = require('express-validator');

//model
const postModel = require('../../models/Post');
const profileModel = require('../../models/Profile');
const userModel = require('../../models/User');

//@route    Post api/posts
//desc      Create post
//access    Private
router.post('/',[auth,[
    body('text','Text is required').not().isEmpty()
]],async(req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        res.status(400).json({errors: errors.array()})
    }
    try {
        const user = await userModel.findById(req.user.id).select('-password')
        const newPost =new postModel({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user:req.user.id
        })
        const post = await newPost.save()
        res.json(post)
    } catch (err) {
        console.log(err.message)
        res.status(500).send('Server error')      
    }
});
//@route    Get api/posts
//desc      Get all posts
//access    Private
router.get('/',auth,async(req,res)=>{
    try {
        const posts = await postModel.find().sort({date: -1})
        res.json(posts)
    } catch (err) {
        console.log(err.message)
        res.status(500).send('Server error')
    }
})
//@route    Get api/posts/:id
//desc      Get post ID
//access    Private
router.get('/:id',auth,async(req,res)=>{
    try {
        const post = await postModel.findById(req.params.id);
        if(!post){
            res.status(400).json({msg:'Post not found'})
        }
        res.json(post)
    } catch (err) {
        console.log(err.message)
        if(err.kind === 'ObjectId'){
            res.status(400).json({msg:'Post not found'})
        } 
        res.status(500).send('Server error')
    }
})
//@route    Delete api/posts/:id
//desc      Delete post by ID
//access    Private
router.delete('/:id',auth,async(req,res)=>{
    try {
        const post = await postModel.findById(req.params.id);
        if(!post){
            res.status(400).json({msg:'Post not found'})
        }
        //check the user
        if(post.user.toString() !== req.user.id ){
            res.status(400).json({msg:'User not authorized'})
        }
        await post.remove()
        res.send('Post removed!')
    } catch (err) {
        console.log(err.message)
        if(err.kind === 'ObjectId'){
            res.status(400).json({msg:'Post not found'})
        } 
        res.status(500).send('Server error')
    }
})
//@route    Put api/posts/like/:id
//desc      Like a post
//access    Private
router.put('/like/:id',auth,async(req,res)=>{
    try {
        const post = await postModel.findById(req.params.id)
        //check if user already been like the post
        if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
            res.status(400).json({msg:'Post already liked'})
        }
        post.likes.unshift({user: req.user.id})
        await post.save()
        res.json(post.likes)
    } catch (err) {
        console.log(err.message)
        res.status(500).send('Server error');
    }
})
//@route    Put api/posts/unlike/:id
//desc      Unlike a post
//access    Private
router.put('/unlike/:id',auth,async(req,res)=>{
    try {
        const post = await postModel.findById(req.params.id)
        //check if user already been like the post
        if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
            res.status(400).json({msg:'Post has not been liked'})
        }
        //get remove index
        const removeIndex = await post.likes.map(like => like.user.toString()).indexOf(req.user.id);
        post.likes.splice(removeIndex,1)
        await post.save()
        res.json(post.likes)
    } catch (err) {
        console.log(err.message)
        res.status(500).send('Server error');
    }
})
//@route    Post api/posts/comment/:id
//desc      Create comment
//access    Private
router.post('/comment/:id',[auth,[
    body('text','Text is required').not().isEmpty()
]],async(req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        res.status(400).json({errors: errors.array()})
    }
    try {
        const user = await userModel.findById(req.user.id).select('-password')
        const post = await postModel.findById(req.params.id)
        const newComment = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user:req.user.id
        }
        post.comments.unshift(newComment)
        await post.save()
        res.json(post.comments)
    } catch (err) {
        console.log(err.message)
        res.status(500).send('Server error')      
    }
});
//@route    Delete api/posts/comment/:comment_id
//desc      Delete comment
//access    Private
router.delete('/comment/:id/:comment_id',auth,async(req,res)=>{
    try {
        const post = await postModel.findById(req.params.id)
        //pull out comment
        const comment = await post.comments.find(comment => comment.id === req.params.comment_id)
        //make sure comment exist
        if(!comment){
            res.status(404).json({msg:'comment does not exist'})
        }
        //check user
        if(comment.user.toString() !== req.user.id){
            res.status(401).json({msg:'User not authorized'})
        }
        //remove index
        const removeIndex = await post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);
        post.comments.splice(removeIndex,1)
        await post.save()
        res.json(post.comments)
    } catch (err) {
        console.log(err.message)
        res.status(500).send('Server error')
    }
})
module.exports = router