const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const fs = require("fs");
const path = require("path");

const appDirName = path.resolve(__dirname, '..')

const adminAuth = require('../config/adminAuth');
const Admin = require('../models/admins');


const adminRouter = express.Router();

adminRouter.use(bodyParser.json());
adminRouter.use(bodyParser.urlencoded({ extended: false }));



adminRouter.route('/login')
.get((req, res, next) => {
    console.log(appDirName)
    res.sendFile(appDirName + "/public/pages/login.html")
})
.post(passport.authenticate('local'),(req, res) => {
    
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported');
})
.delete((req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported');
});



adminRouter.route('/panel')
.get(adminAuth.verifyAdmin,(req, res, next) => {
    res.sendFile(appDirName + "/public/pages/panel.html")
})
.post((req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported');
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported');
})
.delete((req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported');
});


module.exports = adminRouter;