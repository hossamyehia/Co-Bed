const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const fs =  require('fs');
const multer = require('multer');

const authenticate = require('../config/authenticate');
const User = require('../models/users');

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
          user.governorate = req.body.governorate;
          user.coordinates.latitude = req.body.latitude;
          user.coordinates.longitude = req.body.longitude;
          user.totalBeds = req.body.totalBeds;
          user.coronaBeds = req.body.coronaBeds;
          user.totalAvaibleBeds = req.body.totalAvaibleBeds;
          user.coronaAvaibleBeds = req.body.coronaAvaibleBeds;

          let newPath = `/images/${user._id}`;
          let newName = `${newPath}/cover.jpg`;
          let oldName = `public/images/default.jpg`;
          user.image = newName;
          
          fs.mkdir(`public${newPath}/posts`, { recursive: true }, (err) => {
            if (err) throw err;
            });

          fs.mkdir(`public${newPath}`, { recursive: true }, (err) => {
            if (err) throw err;
            });
            
          fs.copyFile(oldName,`public${newName}`, (err) => {
            if (err) throw err;
            });

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
          if(req.body.governorate)  
            user.governorate = req.body.governorate;
          if(req.body.latitude)
            user.coordinates.latitude = req.body.latitude;
          if(req.body.longitude)
            user.coordinates.longitude = req.body.longitude;
          if(req.body.totalBeds)
            user.totalBeds = req.body.totalBeds;
          if(req.body.coronaBeds)
            user.coronaBeds = req.body.coronaBeds;
          if(req.body.totalAvaibleBeds)
            user.totalAvaibleBeds = req.body.totalAvaibleBeds;
          if(req.body.coronaAvaibleBeds)
          user.coronaAvaibleBeds = req.body.coronaAvaibleBeds;
          if(req.file){
            let ext = req.file.mimetype.split("/")[1];
            let newPath = `/images/${user._id}`;
            let newName = `${newPath}/cover.${ext}`;
            let oldName = `tmp/uploads/${req.file.filename}`;
            user.image = newName;

            fs.rename(oldName,`public${newName}`, (err) => {
              if (err) throw err;
              });
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
  let token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, token: token, status: 'You are successfully logged in!'});
});

module.exports = usersRouter;