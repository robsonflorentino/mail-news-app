var express = require('express');
var controller = require('./upload.controller');

var router = express.Router();

router.post('/', controller.send);

module.exports = router;
