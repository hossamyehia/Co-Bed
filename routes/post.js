const express = require('express');
const bodyParser = require('body-parser');
const fs =  require('fs');
const multer = require('multer');


const authenticate = require('../config/authenticate');
const Post = require('../models/posts');
const driveAPI = require("../config/driveAPI")


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'tmp/uploads');
  },

  filename: (req, file, cb) => {
      let ext = file.mimetype.split("/")[1];
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`)
  }
});

const imageFileFilter = (req, file, cb) => {
  if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('You can upload only image files!'), false);
  }
  cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFileFilter});

const postsRouter = express.Router();

postsRouter.use(bodyParser.json());


postsRouter.route('/')
.post(authenticate.verifyUser, upload.single('imageFile'), (req, res, next) => {
    
    let newPost = {
        author : req.user._id
    };

    if(req.body.title)
        newPost.title = req.body.title;
    if(req.body.description)
        newPost.description = req.body.description;
    
    Post.create(newPost)
        .then((post,err) => {
            if(err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.json({err: err});
            }
            else{  
                if(req.file){
                    let ext = req.file.mimetype.split("/")[1];
                    let name = `${post._id}.${ext}`
                    let newDest = `images/${req.user._id}/posts`;
                    let oldPath = `tmp/uploads/${req.file.filename}`;
                    let newPath = `${newDest}/${name}`;
                    let imageData = {
                        fieldname: "imageFile",
                        originalname: name,
                        mimetype: req.file.mimetype,
                        destination: `public/${newDest}`,
                        Path: `public/${newPath}`
                    }

                    post.image = newPath;
                    fs.renameSync(oldPath,`public/${newPath}`);
                
                    driveAPI.uploadImage(imageData);
                }
                else{
                    post.image = null;
                }

                post.save()
                    .then((post,err) => {
                        if(err){
                            res.statusCode = 500;
                            res.setHeader('Content-Type', 'application/json');
                            res.json({err: err});    
                        }
                        else{
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(post);
                        }
                    });
                
            }
        });
});

postsRouter.route('/:postId')
.put(authenticate.verifyUser,(req, res, next) => {
    Post.findById(req.params.postId)
        .then((post,err) => {
            if(err) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.json({err: err});
            }
            else{
                if(post.author == req.user._id){
                    if(req.body.title)
                        post.title = req.body.title
                    if(req.body.description)
                        post.description = req.body.description
                    if(req.file){
                        let ext = req.file.mimetype.split("/")[1];
                        let name = `${post._id}.${ext}`
                        let newDest = `images/${req.user._id}/posts`;
                        let oldPath = `tmp/uploads/${req.file.filename}`;
                        let newPath = `${newDest}/${name}`;
                        let imageData = {
                            fieldname: "imageFile",
                            originalname: name,
                            mimetype: req.file.mimetype,
                            destination: `public/${newDest}`,
                            Path: `public/${newPath}`
                        }

                        post.image = newPath;

                        fs.renameSync(oldPath,`public/${newPath}`);
                        
                        driveAPI.updateImage(imageData);
                    }

                    post.save()
                        .then((post,err) => {
                            if(err) {
                                res.statusCode = 500;
                                res.setHeader('Content-Type', 'application/json');
                                res.json({err: err});
                            }
                            else{
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(post);
                            }
                    });
                }
                else{
                    res.statusCode = 401;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({err:'You dont own this post to update it'}); 
                }
                    
            }
        });
    
})
.delete(authenticate.verifyUser,(req, res, next) => {
    Post.findById(req.params.postId)
        .then((post,err) => {
            if(err) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.json({err: err});
            }
            else{
                if(post.author == req.user._id){
                    if(post.image){
                        if(fs.existsSync(`public/${post.image}`)){
                            fs.rm(`public/${post.image}`, { recursive: true }, (err) => {
                                if (err) throw err;
                                });
                            driveAPI.deleteImage(post.id,post.author)
                        }   
                    }
                    Post.deleteOne(post)
                        .then((report,err) => {
                            if(err) {
                                res.statusCode = 500;
                                res.setHeader('Content-Type', 'application/json');
                                res.json({err: err});
                            }
                            else{
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json({success: true, status: 'Post deleted'});
                            }
                        });
                    
                }
                else{
                    res.statusCode = 401;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({err:'You dont own this post to delete it'});
                }
                    
            }
        });    
});

module.exports = postsRouter;