/* 사용자 로그인, 회원가입 관련 */

const express = require('express');
const router = express.Router();

const dbconnect = require("../config/database");
const connection = dbconnect.init();

const jwt = require("jsonwebtoken");
const jwtobj = require("../config/jwt");

const sendmail = require('../my_modules/sendmail');

const makePW = require('../config/protectPW');

/**
 * 사용자 로그인
 * 
 * @module userLogin
 * 
 * @param {string} email - req
 * @param {string} password - req
 * 
 */
router.post('/login', function (req, res) {
  let body = req.body;
  let email = body.email;
  let password = body.password;

  //이메일 확인
  let query1 = "select password,salt from user where email = ?";
  connection.query(query1, [email], function (err, row) {
    if (err) {
      throw err
    };
    //이메일이 있을 경우
    if (row.length == 1) {
      let encryptedPW = row[0].password;
      let salt = row[0].salt;
      //비밀번호 일치, jwt 토큰 전송
      if (encryptedPW == makePW.comparePW(salt, password)) {
        let token1 = jwtobj.token(email, "50m");
        res.cookie("user", token1);
        res.json({
          token: token1,
          res: "success"
        });
      }
      //비밀번호 불일치
      else {
        res.json({
          res: "password mismatch"
        });
      }
    }
    //이메일이 없을 경우
    else {
      res.json({
        res: "no email"
      });
    }
  })
});

/**
 * 사용자 회원가입
 * 
 * @module userSignup
 * 
 * @param {string} email - req
 * @param {string} name - req
 * @param {string} password - req
 * 
 */
router.post('/signup', function (req, res) {
  let body = req.body;
  let email = body.email;
  let name = body.name;
  let password = body.password;

  //이메일 중복 확인
  let query1 = "select * from user where email = ?";
  connection.query(query1, [email], function (err, row) {
    if (err) {
      throw err
    };
    //이메일 중복
    if (row.length >= 1) {
      res.json({
        res: "already existing email"
      });
    }
    //없는 이메일, db에 추가
    else {
      let protectedPW = makePW.createPW(password);
      let query2 = "insert into user values (?,?,?,null,?)"
      connection.query(query2, [email, name, protectedPW[1], protectedPW[0]], function (err, row) {
        if (err) {
          throw err
        };
      })
      res.json({
        res: "signup success"
      });
    }
  })
});

/**
 * 임시 비밀번호 발송
 * 
 * @module userFindPW
 * 
 * @param {string} email - req
 * 
 */
router.post('/findpw', function (req, res) {
  let body = req.body;
  let email = body.email;

  //이메일 있는지 확인
  let query1 = "select * from user where email = ?";
  connection.query(query1, [email], function (err, row) {
    if (err) {
      throw err
    };
    //이메일 없을 경우
    if (row.length == 0) {
      res.json({
        res: "No existing email"
      });
    }
    //이메일 존재할 경우
    else {
      let query2 = "update user set password = ?, salt = ? where email = ?"
      let randomPW = Math.random().toString(36).substr(2, 11); // 10자리 password
      let protectedPW = makePW.createPW(randomPW);
      //랜덤한 비밀번호로 변경
      connection.query(query2, [protectedPW[1], protectedPW[0], email], function (err, row) {
        if (err) {
          throw err
        };
        //이메일 전송
        try {
          sendmail(email, randomPW);
          res.json({
            res: "send email success"
          });
        }
        //이메일 전송 실패
        catch (e) {
          console.log(e);
          res.json({
            res: "send email failed"
          });
        }
      })
    }
  })
});

/**
 * 사용자 비밀번호 변경
 * 
 * @module userChangePW 
 * 
 * @param {Object} JWT - req
 * @param {string} password - req
 * 
 */
router.post('/changepw', function (req, res) {
  //jwt 토큰 받기
  let token = req.cookies.user;
  let decoded = jwt.verify(token, jwtobj.secret);

  if (decoded) {
    let email = decoded.email;
    let password = req.body.password;
    let protectedPW = makePW.createPW(password);
    let query = "update user set password = ?, salt = ? where email = ?"
    //랜덤한 비밀번호로 변경
    connection.query(query, [protectedPW[1], protectedPW[0], email], function (err, row) {
      if (err) {
        throw err
      };
      res.json({
        res: 'successfully changed'
      });
    })
  } else {
    res.json({
      res: '권한 없음'
    });
  }
});





//////////////////////////////////////////////////////연습용///////////////////////////////////////////

// jwt 확인하기

router.get('/Loginpractice/logincheck', function (req, res, next) {
  let token = req.cookies.user;

  let decoded = jwt.verify(token, jwtobj.secret);
  console.log(decoded.email);
  if (decoded) {
    res.render('index', {
      title: '권한이 있어서 API 수행 가능'
    });
  } else {
    res.render('index', {
      title: '권한이 없습니다.'
    });
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