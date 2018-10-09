var express = require('express');
var router = express.Router();
var Competition = require('../models/competition');
var Competitor = require('../models/competitor');
var passport = require('passport');

router.get('/', function(req, res) {
  res.render('landing');
});

router.get('/propozice', function(req, res) {
  Competition.findOne({ isActive: true }, function(err, activeComp) {
    if (err || !activeComp) {
      res.redirect('/');
    } else {
      res.render('propozice', { competition: activeComp });
    }
  });
});

router.get('/zavody', function(req, res) {
  Competition.find({}, function(err, competitions) {
    if (err || !competitions) {
      res.redirect('/');
    } else {
      res.render('zavody', { competitions: competitions });
    }
  });
});

router.get('/zavody/:id', function(req, res) {
  Competition.findById(req.params.id, function(err, foundCompetition) {
    if (err || !foundCompetition) {
      return res.redirect('/zavody');
    }
    res.render('competitions/show', { competition: foundCompetition });
  });
});

router.get('/prihlaska', function(req, res) {
  Competition.findOne({ isActive: true }, function(err, foundCompetition) {
    if (err) {
      res.redirect('/');
    } else {
      console.log(foundCompetition);
      res.render('admin/competitions/signup', {
        competition: foundCompetition
      });
    }
  });
});

router.post('/:id/prihlaska', function(req, res) {
  Competition.findById(req.params.id, function(err, foundCompetition) {
    if (err || !foundCompetition) {
      console.log(err);
      res.redirect('/');
    } else {
      let competitor = new Competitor({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        dateOfBirth: req.body.dateOfBirth,
        email: req.body.email
      });
      competitor.dogName = req.body.dogs;
      competitor.dogRace = req.body.dogsRace;
      Competitor.create(competitor, function(err, createdCompetitor) {
        if (err) {
          console.log(err);
          req.redirect('/');
        } else {
          createdCompetitor.category = req.body.category;
          createdCompetitor.save();
          foundCompetition.competitors.push(createdCompetitor._id);
          foundCompetition.save();
          res.redirect('/zavody');
        }
      });
    }
  });
});

router.get('/zavody/:id/prihlasky', function(req, res) {
  let SortObj = {};
  let WhereObj = {};

  if (req.query.where && req.query.where != 'all') {
    WhereObj['isRegistered'] = req.query.where;
  } else {
    WhereObj['isRegisterd'] = null;
  }

  if (req.query.field && req.query.field != '') {
    if (req.query.field == 'time' && req.query.time) {
      console.log(req.query.time);
      const Hours = req.query.time.slice(0, 2);
      const Minutes = req.query.time.slice(3, 5);
      const Seconds = req.query.time.slice(6, 8);
      console.log(Hours + ':' + Minutes + ':' + Seconds);
      WhereObj[req.query.field] = {
        $lte: new Date(
          '1899-12-31 ' + Hours + ':' + Minutes + ':' + Seconds + '.000'
        )
      };
    }

    if (req.query.size && req.query.size != 0) {
      WhereObj[req.query.field] = { $lte: req.query.size };
    }
  }

  console.log(WhereObj);

  if (req.query.order) {
    SortObj[req.query.order] = 1;
  } else {
    SortObj['place'] = 1;
  }

  console.log(SortObj);

  Competition.findById(req.params.id)
    .populate({
      path: 'competitors',
      options: {
        sort: SortObj,
        where: WhereObj
      }
    })
    .exec(function(err, foundCompetition) {
      if (err || !foundCompetition) {
        return res.redirect('/');
      }

      res.render('competitions/prihlasky', { competition: foundCompetition });
    });
});

router.get('/kontakt', function(req, res) {
  res.render('kontakt');
});

router.get('/fotoalbum', function(req, res) {
  res.render('fotoalbum');
});

// AUTH

router.get('/admin/login', function(req, res) {
  res.render('login');
});

router.post(
  '/admin/login',
  passport.authenticate('local', {
    successRedirect: '/admin',
    failureRedirect: '/admin/login'
  }),
  function(req, res) {}
);

router.get('/admin/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

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
