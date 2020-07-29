//구독 하기/취소 관련

const express = require('express');
const router = express.Router();

const dbconnect = require("../config/database");
const connection = dbconnect.init();

const jwt = require("jsonwebtoken");
const jwtobj = require("../config/jwt");

const variables = require('../my_modules/var');

//////////////////////
// 해당 상품 구독하기 //
//////////////////////
router.post('/send', function (req, res) {
    //jwt 토큰 받기
    let token = req.cookies.user;
    let decoded = jwt.verify(token, jwtobj.secret);

    if (decoded) {
        let body = req.body;
        let email = decoded.email;
        let product_id = body.p_ID;
        let push_alarm = body.pushalarm;
        let chatstart_time = body.chatstart_time;
        let chatend_time = body.chatend_time;

        let query = "select subscribe_check from chatSubscribing where femail = ? and fproduct_ID = ?";

        // 변경하기
        var checksubscribing = new Promise((resolve, reject) => {
            connection.query(query, [email, product_id], function (err, row) {
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
                let insert_chatSubscribing_query = "insert into chatSubscribing values (?,?,?,?,?)";

                //diary에 정보 삽입
                var insertdiary = new Promise((resolve, reject) => {
                    const today = new Date();
                    today.toISOString.substring(0,10).replace("-","");

                    connection.query(insert_diary_query, [today,today], function (err, row) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(row);
                        }
                    })
                })

                insertdiary.then((row) => {
                    
                }).catch(err => {
                    throw err;
                });

            } else {
                //구독 취소
                //기존에 있던 상품 이어서 구독
                //구독된 상품의 시간 변경
            }

        }).catch(err => { //실패시
            throw err;
        });
    } else {
        res.json({
            res: '권한 없음'
        });
    }

});

module.exports = router;