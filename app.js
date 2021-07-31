const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const passport = require('passport');
const bodyParser = require('body-parser');
const connectDB = require("./config/db");
const cors = require("cors");

const dotenv = require("dotenv");
dotenv.config();

const indexRouter = require("./routes/index");
const adminRouter = require("./routes/admin");
const styleRouter = require("./routes/style");
const usersRouter = require("./routes/user");
const postsRouter = require("./routes/post");
const searchRouter = require("./routes/search");
const imageRouter = require("./routes/image")

connectDB();


var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(cors())
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(express.static(__dirname + '/public'));


app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/stylesheet', styleRouter);
app.use('/users', usersRouter);
app.use('/posts', postsRouter);
app.use('/search', searchRouter);
app.use('/images', imageRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
