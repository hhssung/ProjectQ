//구독 하기/취소 관련

const express = require('express');
const router = express.Router();

const dbconnect = require("../config/database");
const connection = dbconnect.init();

const jwt = require("jsonwebtoken");
const jwtobj = require("../config/jwt");

const variables = require('../my_modules/var');

//랜덤한 시간 만들기
function setrandomtime(starttime, endtime) {
    var date = new Date();
    var now_time = "" + date.getHours() + date.getMinutes();
    //현재 시각이 default 값보다 지났을 경우
    if (now_time > endtime || now_time < starttime) {
        return "9999";
    }
    //랜덤 설정할수 있을 경우 hhmm
    else {
        var random = Math.random();
        var end_hour = parseInt(endtime.substring(0, 2));
        var start_hour = parseInt(starttime.substring(0, 2));
        var hh = Math.floor(random * (end_hour - start_hour) + start_hour);
        hh = hh >= 10 ? hh : '0' + hh;
        var mm = Math.floor(random * 60);
        mm = mm >= 10 ? mm : '0' + mm;
        var clock = "" + hh + mm;
        return clock;
    }
}

//yyyyMMdd 형태로 날짜 가공하기
function getFormatDate(date) {
    var year = date.getFullYear(); //yyyy
    var month = (1 + date.getMonth()); //M
    month = month >= 10 ? month : '0' + month; //month 두자리로 저장
    var day = date.getDate(); //d
    day = day >= 10 ? day : '0' + day; //day 두자리로 저장
    return '' +
        year + month + day; //'-' 추가하여 yyyy-mm-dd 형태 생성 가능
}

//hhmm 형태로 시간 가공하기
function getFormatClock(date) {
    var hour = (1 + date.getHours()); //h
    hour = hour >= 10 ? hour : '0' + hour; //hour 두자리로 저장
    var minutes = date.getMinutes(); //m
    minutes = minutes >= 10 ? minutes : '0' + minutes; //minute 두자리로 저장
    return '' + hour + minutes;
}

///////////////////////////
// 구독 버튼 확인 or 취소 //
///////////////////////////
router.post('/push_setting', function (req, res) {
    //jwt 토큰 받기
    let token = req.cookies.user;
    let decoded = jwt.verify(token, jwtobj.secret);

    if (decoded) {
        let body = req.body;
        let email = decoded.email;
        let product_id = body.p_ID;
        let subscribe_check = body.subscribe;
        let start_time = body.start_time;
        let end_time = body.end_time;
        let pushType = body.pushType;

        // 구독 취소
        if (subscribe_check == 0) {
            // subscribe_check 1 -> 0으로 바꾸기
            function cancelSubscribing() {
                return new Promise((resolve, reject) => {
                    let query1 = "UPDATE chatSubscribing SET subscribe_check = 0 WHERE femail = ? and fproduct_ID = ?"
                    connection.query(query1, [email, product_id], function (err, row) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    })
                });
            }
            cancelSubscribing()
                .then(() => {
                    res.json({
                        res: "updated"
                    });
                }).catch(err => { //실패시
                    res.json({
                        res: "cannot update"
                    });
                    console.log(err);
                });
        }
        // 구독하기
        else {
            // 구독 여부 DB에서 불러오기
            function checkSubscribing() {
                return new Promise((resolve, reject) => {
                    let query1 = "select subscribe_check from chatSubscribing where femail = ? and fproduct_ID = ?";
                    connection.query(query1, [email, product_id], function (err, row) {
                        if (err) {
                            reject(err);
                        } else {
                            checkNewSubscriber = row.length;
                            resolve(row.length);
                        }
                    })
                })
            }
            /* 신규 구독 시 사용되는 promise */
            // Diary DB에 넣기
            function insertDiary() {
                return new Promise((resolve, reject) => {
                    let insert_diary_query = "insert into diary values (0,?,?,0,?)";
                    const today = new Date();
                    // 20170808 형식
                    let getformattoday = getFormatDate(today);
                    connection.query(insert_diary_query, [getformattoday, getformattoday, 'nolink'], function (err, row1) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(row1);
                        }
                    })
                })
            }
            // chatSubscribing DB에 넣기
            function insertChatSubscribing(row1) {
                return new Promise((resolve, reject) => {
                    let insert_chatSubscribing_query = "insert into chatSubscribing SET ?";
                    const today = new Date();
                    // 20170808 형식
                    let getformattotime = getFormatClock(today);
                    let alarm_time;
                    //랜덤 pushtype일 경우
                    if (pushType == 1) {
                        if (getformattotime > end_time) {
                            //현재 시간보다 랜덤 끝 시간이 더 작을 경우
                            alarm_time = setrandomtime(start_time, end_time);
                        } else {
                            alarm_time = setrandomtime(getformattotime, end_time);
                        }
                    }
                    //정시 pushtype일 경우
                    else {
                        alarm_time = start_time;
                    }
                    let query_inputs = {
                        femail: email,
                        fproduct_ID: product_id,
                        fdiary_ID: row1.insertId,
                        chatstart_time: start_time,
                        chatend_time: end_time,
                        chatalarm_time: alarm_time,
                        subscribe_check: 1
                    }
                    connection.query(insert_chatSubscribing_query, query_inputs, function (err, row2) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    })
                })
            }
            /* 이어서 구독 시 사용되는 promise */
            // chatSubscribing 변경
            function updateChatSubscribing() {
                return new Promise((resolve, reject) => {
                    let query2 = "UPDATE chatSubscribing SET subscribe_check = 1 WHERE femail = ? and fproduct_ID = ?"
                    connection.query(query2, [email, product_id], function (err, row) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(row);
                        }
                    })
                })
            }

            checkSubscribing()
                .then((len) => {
                    // 신규 구독
                    if (len < 1) {
                        insertDiary()
                            .then(insertChatSubscribing)
                            .then(() =>
                                res.json({
                                    res: "updated"
                                }))
                            .catch(err => {
                                throw err
                            })
                    } 
                    // 예전에 구독 한 적이 있을 경우
                    else {
                        updateChatSubscribing()
                            .then(() =>
                                res.json({
                                    res: "updated"
                                }))
                            .catch(err => {
                                throw err
                            })
                    }
                }).catch(err => {
                    throw err
                })
        }
    } else {
        res.json({
            res: 'jwt expired'
        });
    }
});

//////////////
// 시간 변경 //
//////////////
router.post('/time_setting', function (req, res) {
    //jwt 토큰 받기
    let token = req.cookies.user;
    let decoded = jwt.verify(token, jwtobj.secret);

    if (decoded) {
        let body = req.body;
        let email = decoded.email;
        let product_id = body.p_ID;
        let start_time = body.start_time;
        let end_time = body.end_time;
        let pushType = body.pushType;

        let alarm_time;
        //랜덤
        if (pushType == 1) {
            alarm_time = setrandomtime(start_time, end_time);
        }
        //정시
        else {
            alarm_time = start_time;
        }
        let query = "UPDATE chatSubscribing SET chatstart_time = ?, chatend_time = ?, chatalarm_time = ? WHERE femail = ? and fproduct_ID = ?"
        let query_input = [start_time, end_time, alarm_time, email, product_id];
        connection.query(query, query_input, function (err, row) {
            if (err) {
                res.json({
                    res: "query err"
                })
            } else {
                res.json({
                    res: "updated"
                })
            }
        });
    } else {
        res.json({
            res: 'jwt expired'
        });
    }
});

module.exports = router;