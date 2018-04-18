var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('swimlanes', {user: req.session.passport.user, title: 'Express' });
});

module.exports = router;