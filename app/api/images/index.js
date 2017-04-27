var express = require('express');
var controller = require('./images.controller');

var router = express.Router();

router.get('/', controller.send);

module.exports = router;
