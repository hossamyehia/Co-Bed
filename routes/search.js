const express = require('express');
const bodyParser = require('body-parser');


const Post = require('../models/posts');
const User = require('../models/users');

const searchRouter = express.Router();

searchRouter.use(bodyParser.json());


searchRouter.route('/')
.get((req, res, next) => {
    User.aggregate([{ $match: { governorate:req.body.governorate} }]).sort({ coronaAvaibleBeds: -1,totalAvaibleBeds: -1}).project({_id:1 ,name:1 ,image:1})
        .then((users,err) => {
            if(err) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.json({err: err});
            }
            else{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(users);
            }
        });
                           
});


searchRouter.route('/:userId')
.get((req, res, next) => {
    User.findById(req.params.userId,'coronaAvaibleBeds totalAvaibleBeds')
        .then((user,err) => {
            if(err) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.json({err: err});
            }
            else{
                
                Post.aggregate([{ $match: { author: req.params.userId } }]).sort({ createdAt: -1}).project({ author: 0, createdAt: 0, updatedAt: 0})
                    .then((posts,err) => {
                        if(err) {
                            res.statusCode = 404;
                            res.setHeader('Content-Type', 'application/json');
                            res.json({err: err});
                            return;
                        }
                        else{

                            let data = {
                                coronaAvaibleBeds: user.coronaAvaibleBeds,
                                totalAvaibleBeds: user.totalAvaibleBeds,
                                posts: posts
                            };

                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(data);
                        }
                            
                    });

                
            }
        });
    
});


module.exports = searchRouter;