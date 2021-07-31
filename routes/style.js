const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require("path");

const appDirName = path.resolve(__dirname, '..')

const styleRouter = express.Router();

styleRouter.use(bodyParser.json());

styleRouter.route('/panel.css')
.get((req, res, next) => {
    res.sendFile(appDirName + "/public/stylesheet/panel.css")
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

styleRouter.route('/login.css')
.get((req, res, next) => {
    res.sendFile(appDirName + "/public/stylesheet/login.css")
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


module.exports = styleRouter;