//사용자 다이어리 관련

const express = require('express');
const router = express.Router();

const dbconnect = require("../config/database");
const connection = dbconnect.init();

const jwt = require("jsonwebtoken");
const jwtobj = require("../config/jwt");

// 20180909, 0300 => 20180909 030000
function string_to_fulltime(str_date, str_hour) {
  return str_date + " " + str_hour;
}

//////////////////////////
// 내가 쓴 다이어리 조회 //
//////////////////////////
router.get('/lookup', function (req, res) {
  //jwt 토큰 받기
  let token = req.cookies.user;
  let decoded = jwt.verify(token, jwtobj.secret);

  if (decoded) {
    let email = decoded.email;

    var chating_temp;
    var chating = new Array();
    var diary_temp;
    var diary = new Array();

    //모든 다이어리 정보 불러오기
    function get_diary() {
      return new Promise((resolve, reject) => {
        let query = "select d_ID, chatedperiod_start, chatedperiod_end, chatedamount, chatcontent, chateddate, chatedtime from diary inner join chatSubscribing on femail = ? and fdiary_ID = d_ID inner join chating on chating.fd_ID = diary.d_ID";
        connection.query(query, email, function (err, row) {
          if (err) {
            reject(err);
          } else {
            for (let i = 0; i < row.length; i++) {
              if (i < row.length - 1 && row[i].d_ID == row[i + 1].d_ID) {
                chating_temp = new Object();
                chating_temp.chatcontent = row[i].chatcontent;
                chating_temp.time = string_to_fulltime(row[i].chateddate, row[i].chatedtime);
                chating.push(chating_temp);
              } else {
                chating_temp = new Object();
                chating_temp.chatcontent = row[i].chatcontent;
                chating_temp.time = string_to_fulltime(row[i].chateddate, row[i].chatedtime);
                chating.push(chating_temp);
                diary_temp = new Object();
                diary_temp.d_ID = row[i].d_ID;
                diary_temp.chatedperiod_start = row[i].chatedperiod_start;
                diary_temp.chatedperiod_end = row[i].chatedperiod_end;
                diary_temp.chatedamount = row[i].chatedamount;
                diary_temp.chating = chating;
                diary.push(diary_temp);
                chating = new Array();
              }
            }
            resolve();
          }
        })
      })
    };

    get_diary()
      .then(() => {
        res.json({
          res: diary
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

//////////////////
// 다이어리 삭제 //
//////////////////
router.post('/delete', function (req, res) {
  //jwt 토큰 받기
  let token = req.cookies.user;
  let decoded = jwt.verify(token, jwtobj.secret);

  if (decoded) {
    let query = "delete from diary where d_ID = ?";
    let d_ID = req.body.d_ID;
    connection.query(query, d_ID, function (err, row) {
      if (err) {
        res.json({
          res: 'query err'
        });
      } else {
        res.json({
          res: 'updated'
        });
      }
    })
  } else {
    res.json({
      res: '권한 없음'
    });
  }
});

//////////////////
// 다이어리 백업 //
//////////////////
router.post('/backup', function (req, res) {
  //jwt 토큰 받기
  let token = req.cookies.user;
  let decoded = jwt.verify(token, jwtobj.secret);

  if (decoded) {


  } else {
    res.json({
      res: '권한 없음'
    });
  }
});


module.exports = router;