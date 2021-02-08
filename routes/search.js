const express = require('express');
const bodyParser = require('body-parser');


const Post = require('../models/posts');
const User = require('../models/users');

const searchRouter = express.Router();

searchRouter.use(bodyParser.json());


searchRouter.route('/')
.get((req, res, next) => {
    User.aggregate([{ $match: { city:req.query.city} }]).sort({ coronaAvailableBeds: -1,totalAvailableBeds: -1}).project({ accepted: 0, username: 0, salt: 0,hash: 0,__v: 0 })
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
     Post.aggregate([{ $match: { author: req.params.userId } }]).sort({ createdAt: -1}).project({ author: 0, createdAt: 0, updatedAt: 0})
        .then((posts,err) => {
            if(err) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.json({err: err});
            }
            else{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(posts);
            }                
        });
});


module.exports = searchRouter;