var express = require('express');
var request = require('request');
var async = require('async');

var planetRouter = express.Router();

var router = function () {

  planetRouter.route('/')
    .get(function (req, res) {

      var url = 'http://swapi.co/api/planets/';

      request({
        method: 'GET',
        uri: url,
        header: {'content-type': 'application/x-www-form-urlencoded;'},
      }, function (error, response, body) {
        if (error) res.sendStatus(500);
        else {

          var planets = JSON.parse(body).results;

          var residentUrlArray = planets.map(function (planet) {
            return planet.residents;
          });

          var formatPlanetResidentsObj = planets.map(function (planet) {
            var key = planet.name.toString();
            var planetObj = {};
            planetObj[key] = [];
            if (planet.residents.length > 0) {
              for (var i = 0; i < planet.residents.length; i++) {
                planetObj[key].push(planet.residents[i]);
              }
            }
            return planetObj;
          });


          function createFormattedObj() {
            var planetObj = {};

            function innerPlanet() {
              for (var i = 0; i < planets.length; i++) {
                (function (pobj) {
                  var key = planets[i].name.toString();
                  pobj[key] = [];
                  return planetObj
                })(planetObj);
              }
              return planetObj
            }
            return innerPlanet
          }

          var planetPropArrayObj = createFormattedObj()();
          var merged = residentUrlArray.concat.apply([], residentUrlArray);
          // console.log(merged);
          var fetch = function (url, cb) {
            request.get(url, function (err, response, body) {
              if (err) {
                cb(err);
              } else {
                cb(null, JSON.parse(body));
              }
            });
          };

          async.map(merged, fetch, function (err, results) {
            if (err) {
              console.log(err);
            } else {
              mapResults(results, planetPropArrayObj, formatPlanetResidentsObj, planets);
            }
          });
        }
      });

      function mapResults(residents, plan, format, planets) {
        var residentNames = residents.map(function (resident) {
          return resident.name;
        });

        var numberResidentsPerPlanet = format.map(function (planet) {
          var num;
          for (prop in planet) {
            num = planet[prop].length;
          }
          return num;
        });

        function rePopulatePlanets() {
          var count = 0;
          var j = 0;

          var newResArray = numberResidentsPerPlanet.map(function (x) {
            var list = [];
            var i = 0;
            j = count;
            while (i < x) {
              list.push(residentNames[j]);
              i++;
              j++;
            }
            count += x;
            return list;

          });

          var z = 0;
          var finished = planets.map(function (planet) {
            var key = JSON.stringify(planet.name);
            var planetObj = {};
            planetObj[key] = newResArray[z];
            z++;
            return planetObj;
          });
          return finished;
        }
        var finished = rePopulatePlanets();

        res.send(finished);
      }

    });

  return planetRouter;
};
module.exports = router;