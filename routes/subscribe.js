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

//yyyymmdd 형태로 날짜 가공하기
function getFormatDate(date) {
    var year = date.getFullYear(); //yyyy
    var month = (1 + date.getMonth()); //M
    month = month >= 10 ? month : '0' + month; //month 두자리로 저장
    var day = date.getDate(); //d
    day = day >= 10 ? day : '0' + day; //day 두자리로 저장
    return '' + year + month + day; //'-' 추가하여 yyyy-mm-dd 형태 생성 가능
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
            let query1 = "UPDATE chatSubscribing SET subscribe_check = 0 WHERE femail = ? and fproduct_ID = ?"
            var cancel_subscribing = new Promise((resolve, reject) => {
                connection.query(query1, [email, product_id], function (err, row) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                })
            })
            cancel_subscribing.then((row) => {
                res.json({
                    res: "updated"
                });
            }).catch(err => { //실패시
                res.json({
                    res: "cannot update"
                });
                throw err;
            });
        }
        // 구독하기
        else {
            let query1 = "select subscribe_check from chatSubscribing where femail = ? and fproduct_ID = ?";
            var checksubscribing = new Promise((resolve, reject) => {
                connection.query(query1, [email, product_id], function (err, row) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                })
            })
            checksubscribing.then((row) => {
                //신규 구독
                if (row.length < 1) {
                    let insert_diary_query = "insert into diary values (0,?,?,0)";
                    let insert_chatSubscribing_query = "insert into chatSubscribing SET ?";

                    //diary에 정보 삽입
                    var insert_diary = new Promise((resolve, reject) => {
                        const today = new Date();
                        // 20170808 형식
                        let getformattoday = getFormatDate(today);
                        connection.query(insert_diary_query, [getformattoday, getformattoday], function (err, row1) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(row1);
                            }
                        })
                    })

                    insert_diary.then((row1) => {
                        let alarm_time;
                        //랜덤
                        if (pushType == 1) {
                            alarm_time = setrandomtime(start_time, end_time);
                        }
                        //정시
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
                                res.json({
                                    res: "query err"
                                })
                                throw err
                            } else {
                                res.json({
                                    res: "updated"
                                })
                            }
                        })
                    }).catch(err => {
                        throw err;
                    });

                }
                //기존에 있던 다이어리 이어서 쓰기 
                else {
                    let query2 = "UPDATE chatSubscribing SET subscribe_check = 1 WHERE femail = ? and fproduct_ID = ?"
                    var again_subscribing = new Promise((resolve, reject) => {
                        connection.query(query2, [email, product_id], function (err, row) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(row);
                            }
                        })
                    })
                    again_subscribing.then((row) => {
                        res.json({
                            res: "updated"
                        });
                    }).catch(err => { //실패시
                        res.json({
                            res: "cannot update"
                        });
                        throw err;
                    });
                }
            }).catch(err => { //실패시
                throw err;
            });
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