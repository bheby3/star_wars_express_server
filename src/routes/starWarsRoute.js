var express = require('express');
var request = require('request');

var starWarsRouter = express.Router();

var router = function(nav){
    starWarsRouter.route('/')
    .get(function (req, res) {
        var url = 'https://swapi.co/api/people/';
        request({
            method: 'GET',
            uri: url,
            header: {'content-type': 'application/x-www-form-urlencoded;'},
        }, function (error, response, body) {
            if (error) res.sendStatus(500);
            else {

                var starWarsCharcters = JSON.parse(body).results;
                if (req.query.sort) {
                    starWarsCharcters.sort(function (a, b) {
                        return b[req.query.sort] < a[req.query.sort]
                    });
                    console.log('\n\n\n star sorted:', starWarsCharcters);
                }

                res.render('characterListView', {
                    starWarsCharacter: 'Character',
                    nav: nav,
                    starChar: starWarsCharcters,
                });

            }
        });

        starWarsRouter.route('/:id')
          .get(function (req, res) {
              var id = req.params.id;
              res.render('bookView', {
                  title: 'Books',
                  nav: nav,
                  book: books[id]
              });
          });
    });
    
    return starWarsRouter;
}
module.exports = router;
