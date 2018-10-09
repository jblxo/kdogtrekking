var express = require('express');
var router = express.Router();
var News = require('../models/news');

// INDEX
router.get('/', function(req, res) {
  News.find({})
    .sort({ _id: -1 })
    .exec(function(err, foundNews) {
      if (err) {
        console.log(err);
      } else {
        res.render('news', { news: foundNews });
      }
    });
});

// SHOW

router.get('/:id', function(req, res) {
  News.findById(req.params.id, function(err, foundNews) {
    if (err || !foundNews) {
      console.log(err);
      res.redirect('/');
    } else {
      res.render('news/show', { news: foundNews });
    }
  });
});

module.exports = router;
