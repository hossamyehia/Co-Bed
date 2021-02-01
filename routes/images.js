const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../config/authenticate');


const uploadRouter = express.Router();

uploadRouter.use(bodyParser.json());

uploadRouter.route('/:userId/:imageName')
.get((req, res, next) => {
    let filePath = `/images/${req.params.userId}/${req.params.imageName}`; 
    res.sendFile(filePath);
})
.post((req, res) => {
    res.statusCode = 403;
    res.end('GET operation not supported');
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported');
})
.delete((req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported');
});

uploadRouter.route('/:userId/posts/:imageName')
.get((req, res, next) => {
    let filePath = `/images/${req.params.userId}/${req.params.imageName}`; 
    res.sendFile(filePath);
})
.post((req, res) => {
    res.statusCode = 403;
    res.end('GET operation not supported');
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported');
})
.delete((req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported');
});

module.exports = uploadRouter;