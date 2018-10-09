var express = require('express');
var router = express.Router();
var News = require('../models/news');
var Competition = require('../models/competition');
var Category = require('../models/category');
var Competitor = require('../models/competitor');

// Straight redirect to news panel
router.get('/', isLoggedIn, function(req, res) {
  res.redirect('/admin/novinky');
});

// NEWS ROUTES

// INDEX - Render all news
router.get('/novinky', isLoggedIn, function(req, res) {
  News.find({})
    .sort({ _id: -1 })
    .exec(function(err, foundNews) {
      if (err) {
        console.log(err);
      } else {
        res.render('admin/news/', { news: foundNews });
      }
    });
});

// NEW - show a form for new news
router.get('/novinky/nove', isLoggedIn, function(req, res) {
  res.render('admin/news/new');
});

// CREATE
router.post('/novinky', isLoggedIn, function(req, res) {
  News.create(req.body.news, function(err, news) {
    if (err) {
      return res.redirect('/');
    }
    res.redirect('/admin/novinky/' + news._id);
  });
});

// SHOW
router.get('/novinky/:id', isLoggedIn, function(req, res) {
  News.findById(req.params.id, function(err, foundNews) {
    if (err || !foundNews) {
      console.log(err);
    } else {
      res.render('admin/news/show', { news: foundNews });
    }
  });
});

// EDIT
router.get('/novinky/:id/upravit', isLoggedIn, function(req, res) {
  News.findById(req.params.id, function(err, foundNews) {
    if (err || !foundNews) {
      console.log(err);
      res.redirect('/news');
    } else {
      res.render('admin/news/edit', { news: foundNews });
    }
  });
});

// UPDATE
router.put('/novinky/:id', isLoggedIn, function(req, res) {
  req.body.news.description = req.body.description;
  News.findByIdAndUpdate(req.params.id, req.body.news, function(
    err,
    updatedNews
  ) {
    if (err || !updatedNews) {
      console.log(err);
      res.redirect('/novinky/' + req.params.id + '/edit');
    } else {
      res.redirect('/novinky/' + updatedNews._id);
    }
  });
});

// DESTROY
router.delete('/novinky/:id', isLoggedIn, function(req, res) {
  News.remove({ _id: req.params.id }, function(err, removedNews) {
    if (err) {
      console.log(err);
      res.redirect('/novinky');
    } else {
      res.redirect('/admin/novinky');
    }
  });
});

// COMPETITION ROUTES

// INDEX
router.get('/zavody', isLoggedIn, function(req, res) {
  Competition.find({}, function(err, competitions) {
    if (err) {
      console.log(err);
      res.redirect('/');
    } else {
      res.render('admin/competitions/index', { competitions: competitions });
    }
  });
});

// NEW
router.get('/zavody/nove', isLoggedIn, function(req, res) {
  Category.find({}, function(err, categories) {
    if (err) {
      console.log(err);
      res.redirect('/');
    } else {
      res.render('admin/competitions/new', { categories: categories });
    }
  });
});

// SHOW
router.get('/zavody/:id', isLoggedIn, function(req, res) {
  Competition.findById(req.params.id, function(err, foundCompetition) {
    if (err || !foundCompetition) {
      console.log(err);
      res.redirect('/');
    } else {
      res.render('admin/competitions/show', { competition: foundCompetition });
    }
  });
});

// CREATE
router.post('/zavody', isLoggedIn, function(req, res) {
  req.body.competition.description = req.sanitize(
    req.body.competition.description
  );
  req.body.competition.categories = req.body.category;
  Competition.create(req.body.competition, function(err, newCompetition) {
    if (err) {
      console.log(err);
      res.redirect('/admin/zavody');
    } else {
      res.redirect('/admin/zavody');
    }
  });
});

// DELETE
router.delete('/zavody/:id', isLoggedIn, function(req, res) {
  Competition.findByIdAndRemove(req.params.id, function(
    err,
    removedCompetition
  ) {
    if (err) {
      return res.redirect('/admin/zavody/' + req.params.id);
    }
    res.redirect('/admin/zavody');
  });
});

// EDIT
router.get('/zavody/:id/upravit', isLoggedIn, function(req, res) {
  Competition.findById(req.params.id, function(err, foundCompetition) {
    if (err || !foundCompetition) {
      return res.redirect('/admin/zavody/' + req.params.id);
    }
    Category.find({}, function(err, categories) {
      if (err) {
        return res.redirect('/admin/zavody/' + req.params.id);
      }
      res.render('admin/competitions/edit', {
        competition: foundCompetition,
        categories: categories
      });
    });
  });
});

// UPDATE
router.put('/zavody/:id', isLoggedIn, function(req, res) {
  req.body.competition.description = req.body.description;
  req.body.competition.categories = req.body.category;
  Competition.findByIdAndUpdate(req.params.id, req.body.competition, function(
    err,
    updatedCompetition
  ) {
    if (err || !updatedCompetition) {
      res.redirect('/admin/zavody/' + req.params.id + '/upravit');
    } else {
      console.log(updatedCompetition);
      res.redirect('/admin/zavody/' + req.params.id);
    }
  });
});

// Competitiors
router.get('/zavody/:id/prihlasky', isLoggedIn, function(req, res) {
  Competition.findById(req.params.id)
    .populate('competitors')
    .exec(function(err, foundCompetition) {
      if (err || !foundCompetition) {
        return res.redirect('/');
      }
      foundCompetition.competitors.sort(compare);
      res.render('admin/competitions/prihlasky', {
        competition: foundCompetition
      });
    });
});

router.get('/zavody/:id/prihlasky/:idC', isLoggedIn, function(req, res) {
  Competition.findById(req.params.id, function(err, foundCompetition) {
    if (err || !foundCompetition) {
      return res.redirect('/');
    }
    Competitor.findById(req.params.idC, function(err, foundCompetitor) {
      if (err || !foundCompetitor) {
        return res.redirect('/');
      }
      res.render('admin/competitors/edit', {
        competitor: foundCompetitor,
        competition: foundCompetition
      });
    });
  });
});

router.put('/zavody/:id/prihlasky/:idC', isLoggedIn, function(req, res) {
  req.body.competitor.category = req.body.category;
  const myDate = new Date(0, 0, 0);

  myDate.setHours(req.body.time.slice(0, 2));
  myDate.setMinutes(req.body.time.slice(3, 5));
  myDate.setSeconds(req.body.time.slice(6, 8));

  req.body.competitor.time = myDate;
  Competitor.findByIdAndUpdate(req.params.idC, req.body.competitor, function(
    err,
    updatedCompetitor
  ) {
    if (err || !updatedCompetitor) {
      console.log(err);
      return res.redirect(
        '/admin/zavody/' + req.params.id + '/prihlasky/' + req.params.idC
      );
    } else {
      console.log(updatedCompetitor);
      console.log('Updated');
      res.redirect('/admin/zavody/' + req.params.id + '/prihlasky');
    }
  });
});

router.delete('/zavody/:id/prihlasky/:idC', isLoggedIn, function(req, res) {
  Competitor.findByIdAndRemove(req.params.idC, function(
    err,
    deletedCompetitor
  ) {
    if (err || !deletedCompetitor) {
      console.log(err);
      return res.redirect('/admin/zavody/' + req.params.id + '/prihlasky');
    }
    res.redirect('/admin/zavody/' + req.params.id + '/prihlasky');
  });
});

// MIDDLEWARE
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/admin/login');
}

// COMPARE FUNCTION
function compare(a, b) {
  const placeA = a.place;
  const placeB = b.place;

  var comparison = 0;
  if (placeA > placeB) {
    comparison = 1;
  } else if (placeA < placeB) {
    comparison = -1;
  }
  return comparison;
}

module.exports = router;
