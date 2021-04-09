const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs')

const indexRouter = express.Router();

indexRouter.use(bodyParser.json());

indexRouter.route('/')
.get((req, res, next) => {
    res.sendFile("/index.html")
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


module.exports = indexRouter;