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

    var total_json = new Array();
    var subscribed = new Array();
    var products = new Array();
    var ajson; // temp

    //모든 상품 정보들 불러오기
    function get_products() {
      return new Promise((resolve, reject) => {
        let query1 = "select * from product";
        connection.query(query1, function (err, row) {
          if (err) {
            reject(err);
          } else {
            for (let i = 0; i < row.length; i++) {
              ajson = new Object();
              ajson.p_ID = row[i].p_ID;
              ajson.img_logo = row[i].img_logo;
              ajson.img_background = row[i].img_background;
              ajson.img_explain = row[i].img_explain;
              ajson.p_name = row[i].p_name;
              ajson.p_intro = row[i].p_intro;
              ajson.pushType = row[i].pushType;
              ajson.start_time = row[i].start_time;
              ajson.end_time = row[i].end_time;
              products.push(ajson);
            }
            resolve();
          }
        })
      })
    }

    function get_productid() {
      return new Promise((resolve, reject) => {
        let query2 = "select * from chatSubscribing where femail = ?";
        connection.query(query2, email, function (err, row2) {
          if (err) {
            reject(err);
          } else {
            for (let i = 0; i < row2.length; i++) {
              ajson = new Object();
              var product_ID =  row2[i].fproduct_ID;
              ajson.p_ID = product_ID;

              // default 시간을 사용자가 바꾼 시간으로 최신화
              var chatstart_time = row2[i].chatstart_time;
              var chatend_time = row2[i].chatend_time;
              for(let j=0; j<products.length; j++)
              {
                if(products[j].p_ID == product_ID)
                {
                  products[j].start_time = chatstart_time;
                  products[j].end_time = chatend_time;
                  break;
                }
              }
              subscribed.push(ajson);
            }
            resolve();
          }
        })
      });
    }

    get_products()
      .then(get_productid)
      .then(() => {
        res.json({
          subscribed: subscribed,
          products: products
        });
      })
      .catch(err => {
        res.json({
          res: 'failed!'
        });
      })

  } else {
    res.json({
      res: '권한 없음'
    });
  }
});

module.exports = router;