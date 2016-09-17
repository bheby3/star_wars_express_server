var express = require('express');
var request = require('request');
var async = require('async');

var app = express();

var port = process.env.PORT || 5000;
var nav = [{
  Link: '/starChar',
  Text: 'StarChar'
}, {
  Link: '/planets',
  Text: 'Planets'
}];

var starWars = require('./src/routes/starWarsRoute')(nav);
var planet = require('./src/routes/planetRoute')(nav);

app.use(express.static('public'));
app.set('views', './src/views');

app.set('view engine', 'ejs');

app.use('/starChar', starWars);
app.use('/planets', planet);

app.get('/', function (req, res) {
  var url = 'https://swapi.co/api/people/';

  var merged = function getUrls() {
    var array = [];
    for (var i = 1; i <= 50; i++) {
      array.push(url + i)
    }
    return array;
  };

  var fetch = function (url, cb) {
    request.get(url, function (err, response, body) {
      if (err) {
        cb(err);
      } else {
        cb(null, JSON.parse(body));
      }
    });
  };

  async.map(merged(), fetch, function (err, results) {
    if (err) {
      console.log(err);
    } else {
      mapResults(results)
    }
  });

  function mapResults(results) {

    var starWarsCharacters = results.map(function (resident) {
      if (resident && !resident.detail && resident !== "null") {
        return resident
      }
      else return results[0];
    });

    if (req.query.sort) {
      if(req.query.sort === 'name') {
      starWarsCharacters.sort(function (a, b) {
        console.log(a, b);
        return b[req.query.sort] < a[req.query.sort]
      });
    } else {
      starWarsCharacters.sort(function (a, b) {
        console.log(a, b);
        return parseInt(b[req.query.sort]) - parseInt(a[req.query.sort]);
      });
    }
      // console.log('\n\n\n star sorted:', starWarsCharacters);
      // res.send(starWarsCharacters);
      res.render('index', {
        title: 'Hello from render',
        starChar: starWarsCharacters,
        nav: [{
          Link: '/planets',
          Text: 'Planets'
        }]
      });
    } else {
      // res.send(starWarsCharacters)
      res.render('index', {
        title: 'Hello from render',
        starChar: starWarsCharacters,
        nav: [{
          Link: '/planets',
          Text: 'Planets'
        }]
      });
    }

  }

});



app.get('/:id', function (req, res) {
  if(req.params.id) {
    var id = req.params.id;

    var char;
    var url = 'https://swapi.co/api/people/?search=' + id;
    request({
        method: 'GET',
        uri: url,
        header: {'content-type': 'application/x-www-form-urlencoded;'},
      },
      function (error, response, body) {
        if (error) res.sendStatus(500);
        else {

          char = JSON.parse(body).results;
          res.render('singleChar', {
            title: 'May the force be with you:',
            char: char[0],
            nav: [{
              Link: '/planets',
              Text: 'Planets'
            }]
          });
        }
      });
  }
});


app.listen(port, function (err) {
  console.log('running server on port ' + port);
});