const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const fs =  require('fs');


const authenticate = require('../config/authenticate');
const User = require('../models/users');
const driveAPI = require('../config/driveAPI');

/*
const multer = require('multer');
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

*/

const usersRouter = express.Router();

usersRouter.use(bodyParser.json());
usersRouter.use(bodyParser.urlencoded({ extended: false }));


usersRouter.post('/signup', (req, res, next) => {
    User.register(new User({username: req.body.username}), 
      req.body.password, (err, user) => {
        if(err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: err});
        }
        else {
          user.name = req.body.name;
          user.phoneNumber = req.body.phoneNumber;
          user.city = req.body.city;
          user.coordinates.latitude = req.body.coordinates.latitude;
          user.coordinates.longitude = req.body.coordinates.longitude;
          user.totalBeds = req.body.totalBeds;
          user.coronaBeds = req.body.coronaBeds;
          user.totalAvailableBeds = req.body.totalAvailableBeds;
          user.coronaAvailableBeds = req.body.coronaAvailableBeds;

          let newDest = `images/${user._id}`;
          let name = "cover.jpeg";
          let newPath = `${newDest}/${name}`;
          let oldPath = `public/images/default.jpeg`;
          user.image = newPath;

          fs.mkdirSync(`public/${newDest}`, { recursive: true });

          fs.mkdirSync(`public/${newDest}/posts`, { recursive: true });
            
          fs.copyFileSync(oldPath,`public/${newPath}`);

          
          user.save((err, user) => {
            if (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.json({err: err});
            }
            else {
              passport.authenticate('local')(req, res, () => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({success: true, status: 'Registration Successful!'});
              });

              driveAPI.newUserFolder(user._id);
            }
        });
        }
      });
});

usersRouter.put('/update',authenticate.verifyUser, (req, res, next) => {
  User.findById(req.user._id) 
      .then((user, err) => {
        if(err) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: err});
        }
        else {
          
          if(req.body.name){
            user.name = req.body.name;
          }
          if(req.body.phoneNumber){
            user.phoneNumber = req.body.phoneNumber;
          }
          if(req.body.city)  {
            user.city = req.body.city;
          }
          if(req.body.coordinates){
            user.coordinates.latitude = req.body.coordinates.latitude;
            user.coordinates.longitude = req.body.coordinates.longitude;
          }
          if(req.body.totalBeds){
            user.totalBeds = req.body.totalBeds;
          }
          if(req.body.coronaBeds){
            user.coronaBeds = req.body.coronaBeds;
          }
          if(req.body.totalAvailableBeds){
            user.totalAvailableBeds = req.body.totalAvailableBeds;
          } 
          if(req.body.coronaAvailableBeds){
            user.coronaAvailableBeds = req.body.coronaAvailableBeds;
          }
          if(req.body.image){
            
            let ext = req.body.image.mimetype.split("/")[1];
            let newDest = `images/${user._id}`;
            let name = `cover.${ext}`
            let newPath = `${newDest}/${name}`;
            let imageData = {
              fieldname: "imageFile",
              originalname: name,
              mimetype: req.body.image.mimetype,
              destination: `public/${newDest}`,
              Path: `public/${newPath}`,
              idOnDrive: req.body.image.id,
            }
             
            
            
            if(fs.existsSync(`public/${user.image}`))
              fs.rmSync(`public/${user.image}`, { recursive: true });
            
            if(!(fs.existsSync(`public/${newDest}`)))
              fs.mkdirSync(`public/${newDest}`, { recursive: true });
            
            user.image = newPath;
            
            /*
            let oldPath = `tmp/uploads/${req.file.filename}`;
            fs.renameSync(oldPath,`public/${newPath}`);
            */

            driveAPI.updateImage(imageData); 
          }

        user.save((err, user) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({err: err});
          }
          else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({success: true, status: 'Update Successful!'});
          }
      });
      }
    });
});


  
usersRouter.post('/login', passport.authenticate('local'), (req, res) => {
  User.aggregate([{ $match: { _id: req.user._id } },{ $project: { username: 0, salt: 0,hash: 0,__v: 0 } }]) 
      .then((user) => {
        if(user) {
          if(user.accepted) {
            let token = authenticate.getToken({_id: req.user._id});
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({success: true, token: token, user: user, status: 'You are successfully logged in!'});
          }
          else {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            res.json({success: false,message: "Your account has not accepted yet"});
          }
        }
        else {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.json({success: false,status: "Not Found"});
        }
      })
      .catch(err => {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.json({err: err});
      });
});

module.exports = usersRouter;