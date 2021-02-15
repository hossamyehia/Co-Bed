const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs')
const driveAPI = require('../config/driveAPI');


const getImageRouter = express.Router();

getImageRouter.use(bodyParser.json());

getImageRouter.route('/:userId/:imageName')
.get(async (req, res, next) => {
    let fileDest = `images/${req.params.userId}`;
    let filePath = `${fileDest}/${req.params.imageName}`; 
    if(fs.existsSync(`public/${filePath}`))
        res.sendFile(filePath);
    else{
        
        let exist = await driveAPI.getImage(fileDest,`public/${filePath}`,req.params.imageName,req.params.userId);
        console.log("exist: "+exist)
        if(exist){
            res.redirect(`/${req.params.userId}/${req.params.imageName}`);
            //res.sendFile(filePath);
        }
        else{
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.json({err: "Image does not exist"});
        }
    }
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


getImageRouter.route('/:userId/posts/:imageName')
.get(async (req, res, next) => {
    let fileDest = `images/${req.params.userId}/posts`
    let filePath = `${fileDest}/${req.params.imageName}`;
    if(fs.existsSync(`public/${filePath}`))
        res.sendFile(filePath);
    else{
        let exist = await driveAPI.getImage(fileDest,`public/${filePath}`,req.params.imageName,req.params.userId);
        console.log("exist: "+exist)
        if(exist){
            res.redirect(`/${req.params.userId}/${req.params.imageName}`);
            //res.sendFile(filePath).end();
        }
        else{
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.json({err: "Image does not exist"});
        }
    }
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

module.exports = getImageRouter;