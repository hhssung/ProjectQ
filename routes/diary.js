/* 다이어리 관련 모듈 */

const express = require('express');
const router = express.Router();

const dbconnect = require("../config/database");
const connection = dbconnect.init();

const jwt = require("jsonwebtoken");
const jwtobj = require("../config/jwt");

/**
 * yyyyMMdd 형태로 날짜 가공하기
 * 
 * @function getFormatDate
 * 
 * @param {date} date 
 * @return {string} yyyyMMdd
 * 
 */
function getFormatDate(date) {
  var year = date.getFullYear(); //yyyy
  var month = (1 + date.getMonth()); //M
  month = month >= 10 ? month : '0' + month; //month 두자리로 저장
  var day = date.getDate(); //d
  day = day >= 10 ? day : '0' + day; //day 두자리로 저장
  return '' + year + month + day; //'-' 추가하여 yyyy-mm-dd 형태 생성 가능
}

/**
 * 내가 이제까지 쓴 모든 다이어리 조회
 * 
 * @module diaryLookup
 * 
 * @param {Object} JWT - req
 * 
 */
router.post('/lookup', function (req, res) {
  //jwt 토큰 받기
  //let token = req.cookies.user;
  let token = req.body.jwt;
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
        let query = "select d_ID, dp_ID, dp_name, chatedperiod_start, chatedperiod_end, chatedamount, chatcontent, chatedtime, color, position from diary inner join chatSubscribing on femail = ? and fdiary_ID = d_ID inner join diaryMessage on diaryMessage.fd_ID = diary.d_ID";
        connection.query(query, email, function (err, row) {
          if (err) {
            console.log(row);
            reject(err);
          } else {  
            // JSON으로 만들기 좋게 가공
            for (let i = 0; i < row.length; i++) {
              if (i < row.length - 1 && row[i].d_ID == row[i + 1].d_ID) {
                chating_temp = new Object();
                chating_temp.chatcontent = row[i].chatcontent;
                chating_temp.time = row[i].chatedtime;
                chating.push(chating_temp);
              } else {
                chating_temp = new Object();
                chating_temp.chatcontent = row[i].chatcontent;
                chating_temp.time = row[i].chatedtime;
                chating.push(chating_temp);
                diary_temp = new Object();
                diary_temp.d_ID = row[i].d_ID;
                diary_temp.dp_ID = row[i].dp_ID;
                diary_temp.dp_name = row[i].dp_name;
                diary_temp.chatedperiod_start = row[i].chatedperiod_start;
                diary_temp.chatedperiod_end = row[i].chatedperiod_end;
                diary_temp.chatedamount = row[i].chatedamount;
                diary_temp.color = row[i].color;
                diary_temp.position = row[i].position;
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
          diary: diary
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
});

/**
 * 선택한 다이어리 삭제
 * 
 * @module diaryDelete
 * 
 * @param {Object} JWT - req
 * @param {int} d_ID - req
 * 
 */
router.post('/delete', function (req, res) {
  //jwt 토큰 받기
  //let token = req.cookies.user;
  let token = req.body.jwt;
  let decoded = jwt.verify(token, jwtobj.secret);

  if (decoded) {
    let d_ID = req.body.d_ID;

    //다이어리 DB에서 삭제
    let query = "delete from diary where d_ID = ?";
    connection.query(query, d_ID, function (err, row) {
      if (err) {
        res.json({
          res: 'fail'
        });
      } else {
        res.json({
          res: 'success'
        });
      }
    })
  } else {
    res.json({
      res: 'noAuth'
    });
  }
});

/**
 * 이제까지 쓴 모든 다이어리 백업. DB에 저장
 * 
 * @module diaryBackup
 * 
 * @param {Object} JWT - req
 * @param {Object} diary - req
 * 
 */
router.post('/backup', function (req, res) {
  //jwt 토큰 받기
  //let token = req.cookies.user;
  let token = req.body.jwt;
  let diary = req.body.diary;
  let decoded = jwt.verify(token, jwtobj.secret);

  if (decoded) {
    let diaryinput = [];
    let diaryMessageinput = [];
    let dmessages;

    // const today = new Date();
    // let chatedperiod_end = getFormatDate(today);

    //DB에 집어넣을 데이터 가공
    function processingData() {
      return new Promise((resolve, reject) => {
        for (let i = 0; i < diary.length; i++) {
          diaryinput.push([diary[i].d_ID, diary[i].p_ID, diary[i].p_name, diary[i].chatedperiod_start, diary[i].chatedperiod_end, diary[i].chatedamount, diary[i].linkname, diary[i].color, diary[i].position]);
          dmessages = diary[i].diaryMessage;
          for (let j = 0; j < dmessages.length; j++) {
            diaryMessageinput.push([dmessages[j].dm_ID, diary[i].d_ID, dmessages[j].chatcontent, dmessages[j].chatedtime]);
          }
        }
        console.log(diaryinput);
        console.log(diaryMessageinput);
        resolve();
      })
    }

    //DB - diary table에 집어넣기
    function putIntoDiary() {
      return new Promise((resolve, reject) => {
        let query = "insert into diary values ? ON DUPLICATE KEY UPDATE dp_name = CONCAT(VALUES(dp_name)), chatedperiod_start = CONCAT(VALUES(chatedperiod_start)), chatedperiod_end = CONCAT(VALUES(chatedperiod_end)), chatedamount = CONCAT(VALUES(chatedamount)), linkname = CONCAT(VALUES(linkname)),color = CONCAT(VALUES(color)),position = CONCAT(VALUES(position));"; //diary insert
        connection.query(query, [diaryinput], function (err, row) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        })
      })
    }

    //DB - diaryMessage table에 집어넣기
    function putIntoDiaryMessage() {
      return new Promise((resolve, reject) => {
        let query2 = "insert into diaryMessage values ? ON DUPLICATE KEY UPDATE chatcontent = CONCAT(VALUES(chatcontent)), chatedtime = CONCAT(VALUES(chatedtime));"; //diaryMessage insert
        connection.query(query2, [diaryMessageinput], function (err, row) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        })
      })
    }

    processingData()
      .then(putIntoDiary)
      .then(putIntoDiaryMessage)
      .then(() => {
        res.json({
          res: 'success'
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
});


module.exports = router;