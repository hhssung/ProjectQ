//관리자 전용 페이지

const express = require('express');
const router = express.Router();

const dbconnect = require("../config/database");
const connection = dbconnect.init();

const variables = require('../my_modules/var');

/////////////////////////////
// 관리자 페이지 로그인 화면 //
/////////////////////////////
router.get('/', function (req, res, next) {
    res.render('admin_login');
});

///////////////////////////
//관리자 페이지 로그인 시도//
///////////////////////////
router.post('/login', function (req, res, next) {
    let body = req.body;
    let id = body.id;
    let password = body.password;

    //id, 비번 확인
    let query1 = "select * from admin";
    connection.query(query1, function (err, row) {
        if (err) {
            throw err
        };
        let idcheck = row[0].ID;
        let pwcheck = row[0].password;
        //id, 비번 일치
        if (idcheck == id && pwcheck == password) {
            // 알림페이지로 가기
            res.render('admin_alert', {
                alert_type: "관리자 페이지 입니다.",
                alert_details: ""
            });
        }
        //불일치
        else {
            res.json({
                res: "id or pw mismatch"
            });
        }

    })
});

/////////////////////////
// 상품 추가 페이지 이동//
/////////////////////////
router.post('/add_product_page', function (req, res, next) {
    res.render('admin_addProduct');
});

////////////////////////////////////////
// 알림페이지에서 상품조회 페이지로 이동//
////////////////////////////////////////
router.post('/alert_to_adminpage', function (req, res, next) {
    ///관리자 페이지로 돌아가기///
    let query = "select p_ID, p_name, img_logo from product";
    let productlist = [];
    connection.query(query, function (err, row_2) {
        if (err) {
            throw err
        };
        for (let i = 0; i < row_2.length; i++) {
            let product = {
                'img_logo': variables.server_files + row_2[i].img_logo,
                'product_name': row_2[i].p_name,
                'product_id': row_2[i].p_ID
            }
            productlist.push(product);
        }
        res.render('admin_page', {
            'productlist': productlist
        });
    })
});

module.exports = router;