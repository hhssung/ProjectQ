var express = require('express');
var router = express.Router();

var dbconnect = require("../config/database.js");
var connection = dbconnect.init(); 

// var mysql = require("mysql");
// var dbconfig = require("../config/database.js");
// var connection = mysql.createConnection(dbconfig);

/* GET home page. */
router.get('/', function(req, res, next) {
  var query1 = "select * from user";
  connection.query(query1, function(err, rows) {
    if (err) {
      throw err
    };
    console.log(rows);
    res.render('index', { title: 'Express' });
  });
});

module.exports = router;
