var express = require('express');
var router = express.Router();

var dbconnect = require("../config/database.js");
var connection = dbconnect.init(); 

var jwt = require("jsonwebtoken");
var jwtobj = require("../config/jwt");

//  Login Function

router.get('/', function (req, res, next) {
  let query1 = "select PW from user where Email='abc@naver.com'"
  let token = jwt.sign({
      email: "abc@naver.com" // 토큰의 내용(payload)
    },
    jwtobj.secret, // 비밀 키
    {
      expiresIn: '5m' // 유효 시간은 5분
    })
  connection.query(query1, function (err, rows) {
    if (err) {
      throw err
    };
    if (rows[0].PW == "1235") {
      res.cookie("user", token);
      res.json({
        token: token
      });
    }else{
      res.render('index', { title: 'password failed' });
    }
  })
});

// jwt 확인하기

router.get('/logincheck', function(req,res,next){
  let token = req.cookies.user;

  let decoded = jwt.verify(token, jwtobj.secret);
  if(decoded){
    res.render('index', { title: '권한이 있어서 API 수행 가능' });
  }
  else{
    res.render('index', { title: '권한이 없습니다.' });
  }
});


module.exports = router;


/*
res.json([{
  	id: 1,
  	username: "samsepi0l"
  }, {
  	id: 2,
  	username: "D0loresH4ze"
  }]);

  models.user.find({
      where: {
        email: "abc@naver.com"
      }
    })
    .then(user => {
      if (user.pwd === "1235") {
        res.cookie("user", token);
        res.json({
          token: token
        })
      }
    })

*/