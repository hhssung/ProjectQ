//상품 조회

const express = require('express');
const router = express.Router();

const dbconnect = require("../config/database");
const connection = dbconnect.init();

const jwt = require("jsonwebtoken");
const jwtobj = require("../config/jwt");

const variables = require('../my_modules/var');

//////////////
// 상품 조회 //
//////////////
router.get('/lookup', function (req, res) {
    //jwt 토큰 받기
    let token = req.cookies.user;
    let decoded = jwt.verify(token, jwtobj.secret);
    
    if (decoded) {
        let email = decoded.email;
        let query = "select * from chatSubscribing where femail = ?";
        var insert_product = new Promise((resolve, reject) => {
            connection.query(query, function (err, row) {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            })
        })
      } else {
        res.json({
          res: '권한 없음'
        });
      }


});

module.exports = router;