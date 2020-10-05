/* 상품 조회 */

const express = require('express');
const router = express.Router();

const dbconnect = require("../config/database");
const connection = dbconnect.init();

const jwt = require("jsonwebtoken");
const jwtobj = require("../config/jwt");

/**
 * 모든 상품 조회
 * 
 * @module productLookup
 * 
 * 
 */
router.post('/lookup', function (req, res) {
  //var subscribed = new Array();
  var products = new Array();
  var products_item; // temp
  var questions = new Array(); //temp2
  var q_contents;

  //DB로부터 '활성화된' 모든 상품 정보들 불러오기
  function getProducts() {
    return new Promise((resolve, reject) => {
      let query1 = "select * from product inner join question on question.fp_ID = product.p_ID where isAvailable = 1";
      connection.query(query1, function (err, row) {
        if (err) {
          reject(err);
        } else {
          // JSON으로 만들기 좋게 가공
          for (let i = 0; i < row.length; i++) {
            if (i < row.length - 1 && row[i].p_ID == row[i + 1].p_ID) {
              q_contents = new Object();
              q_contents.content = row[i].q_content;
              q_contents.q_ID = row[i].q_ID;
              questions.push(q_contents);
            } else {
              q_contents = new Object();
              q_contents.question = row[i].q_content;
              products_item = new Object();
              products_item.p_ID = row[i].p_ID;
              products_item.img_logo = row[i].img_logo;
              products_item.img_background = row[i].img_background;
              products_item.img_explain = row[i].img_explain;
              products_item.p_name = row[i].p_name;
              products_item.p_intro = row[i].p_intro;
              products_item.pushType = row[i].pushType;
              products_item.start_time = row[i].start_time;
              products_item.end_time = row[i].end_time;
              products_item.question = questions;
              products.push(products_item);
              questions = new Array();
            }
          }
          resolve();
        }
      })
    })
  }

  // //DB에서 구독 된 상품의 정보들 가져오기
  // function getSubscribedPid() {
  //   return new Promise((resolve, reject) => {
  //     let query2 = "select * from chatSubscribing where femail = ?";
  //     connection.query(query2, email, function (err, row2) {
  //       if (err) {
  //         reject(err);
  //       } else {
  //         for (let i = 0; i < row2.length; i++) {
  //           products_item = new Object();
  //           var product_ID = row2[i].fproduct_ID;
  //           products_item.p_ID = product_ID;

  //           // default 시간을 사용자가 바꾼 시간으로 최신화
  //           var chatstart_time = row2[i].chatstart_time;
  //           var chatend_time = row2[i].chatend_time;
  //           for (let j = 0; j < products.length; j++) {
  //             if (products[j].p_ID == product_ID) {
  //               products[j].start_time = chatstart_time;
  //               products[j].end_time = chatend_time;
  //               break;
  //             }
  //           }
  //           subscribed.push(products_item);
  //         }
  //         resolve();
  //       }
  //     })
  //   });
  // }

  getProducts()
    //.then(getSubscribedPid)
    .then(() => {
      res.json({
        products: products
      });
    })
    .catch(err => {
      res.json({
        res: 'fail'
      });
    })
});

/**
 * 모든 상품 조회
 * 
 * @module userLookup
 * 
 * @param {Object} JWT - req
 * 
 */
router.post('/userlookup', function (req, res) {
  //jwt 토큰 받기
  //let token = req.cookies.user;
  let token = req.body.jwt;
  var subscribed = new Array();
  var subscribed_item; // temp
  let decoded = jwt.verify(token, jwtobj.secret);
  console.log("hello");
  if (decoded) {
    let email = decoded.email;

    //DB에서 구독 된 상품의 정보들 가져오기
    function getSubscribedPid() {
      return new Promise((resolve, reject) => {
        let query = "select * from chatSubscribing where femail = ? and subscribe_check = 1";
        connection.query(query, email, function (err, row) {
          if (err) {
            reject(err);
          } else {
            for (let i = 0; i < row.length; i++) {
              subscribed_item = new Object();
              subscribed_item.p_ID = row[i].fproduct_ID;
              subscribed_item.chatstart_time = row[i].chatstart_time;
              subscribed_item.chatend_time = row[i].chatend_time;
              subscribed.push(subscribed_item);
            }
            resolve();
          }
        })
      });
    }

    getSubscribedPid()
      .then(() => {
        console.log(subscribed);
        res.json({
          subscribed: subscribed
        });
      })
      .catch(err => {
        res.json({
          res: 'fail'
        });
      })
  } else {
    res.json({
      res: 'noAuth'
    });
  }
})

module.exports = router;
