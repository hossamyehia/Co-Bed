const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const fs =  require('fs');
const multer = require('multer');

const authenticate = require('../config/authenticate');
const User = require('../models/users');
const driveAPI = require('../config/driveAPI');

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



const usersRouter = express.Router();

usersRouter.use(bodyParser.json());


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
          let name = "cover.jpg";
          let newPath = `${newDest}/${name}`;
          let oldPath = `public/images/default.jpg`;
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

usersRouter.post('/update',authenticate.verifyUser,upload.single('imageFile'), (req, res, next) => {
  User.findById(req.user._id) 
      .then((user, err) => {
        if(err) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: err});
        }
        else {
          
          if(req.body.name)
            user.name = req.body.name;
          if(req.body.phoneNumber)
            user.phoneNumber = req.body.phoneNumber;
          if(req.body.city)  
            user.city = req.body.city;
          if(req.body.latitude)
            user.coordinates.latitude = req.body.latitude;
          if(req.body.longitude)
            user.coordinates.longitude = req.body.longitude;
          if(req.body.totalBeds)
            user.totalBeds = req.body.totalBeds;
          if(req.body.coronaBeds)
            user.coronaBeds = req.body.coronaBeds;
          if(req.body.totalAvailableBeds)
            user.totalAvailableBeds = req.body.totalAvailableBeds;
          if(req.body.coronaAvaibleBeds)
          user.coronaAvailableBeds = req.body.coronaAvailableBeds;
          if(req.file){

            let ext = req.file.mimetype.split("/")[1];
            let newDest = `images/${user._id}`;
            let name = `cover.${ext}`
            let newPath = `${newDest}/${name}`;
            let oldPath = `tmp/uploads/${req.file.filename}`;
            let imageData = {
              fieldname: "imageFile",
              originalname: name,
              mimetype: req.file.mimetype,
              destination: `public/${newDest}`,
              Path: `public/${newPath}`
            }
            
            fs.rmSync(`public/${user.image}`, { recursive: true });
            
            user.image = newPath;
            fs.renameSync(oldPath,`public/${newPath}`);
            
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
  User.aggregate([{ $match: { _id: req.user._id } },{ $project: { accepted: 0, username: 0, salt: 0,hash: 0,__v: 0 } }]) 
      .then((user, err) => {
        if(err) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: err});
        }
        else {
          let token = authenticate.getToken({_id: req.user._id});
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({success: true, token: token, user: user, status: 'You are successfully logged in!'}); 
        }
      });
});

module.exports = usersRouter;