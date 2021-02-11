const express = require('express');
const bodyParser = require('body-parser');


const Post = require('../models/posts');
const User = require('../models/users');

const searchRouter = express.Router();

searchRouter.use(bodyParser.json());


searchRouter.route('/')
.get((req, res, next) => {
    User.aggregate([{ $match: { city:req.query.city} }]).sort({ coronaAvailableBeds: -1,totalAvailableBeds: -1}).project({ _id: 1, image: 1, name: 1 })
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
    User.findById(req.params.userId)
        .then((user,err) => {
            if(err) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.json({err: err});
            }
            else{
                let data = {
                    totalBeds: user.totalBeds,
                    coronaBeds: user.coronaBeds,
                    coronaAvailableBeds: user.coronaAvailableBeds,
                    totalAvailableBeds: user.totalAvailableBeds,
                    coordinates: user.coordinates,
                    phoneNumber: user.phoneNumber
                };
                Post.aggregate([{ $match: { author: req.params.userId } }]).sort({ createdAt: -1}).project({ author: 0, createdAt: 0, updatedAt: 0})
                    .then((posts,err) => {
                        if(err) {
                            res.statusCode = 404;
                            res.setHeader('Content-Type', 'application/json');
                            res.json({err: err});
                        }
                        else{
                            data.posts = posts;
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(data);
                        }                
                    });
            }
        });
     
});


module.exports = searchRouter;