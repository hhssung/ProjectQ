/* 관리자 페이지 */

const express = require('express');
const router = express.Router();

const dbconnect = require("../config/database");
const connection = dbconnect.init();

const variables = require('../my_modules/var');

const makePW = require('../config/protectPW');

/* GET 관리자 페이지 로그인 화면 */
router.get('/', function (req, res, next) {
    res.render('admin_login');
});

/**
 * 관리자 페이지 로그인 시도
 * 
 * @module adminLogin
 * 
 * @param {string} id - req
 * @param {string} password - req
 * 
 */
router.post('/login', function (req, res, next) {
    let body = req.body;
    let id = body.id;
    let password = body.password;

    //DB에서 id, 비밀번호 확인
    let query1 = "select * from admin";
    connection.query(query1, function (err, row) {
        if (err) {
            throw err
        };
        let idcheck = row[0].ID;
        let encryptedPW = row[0].password;
        let salt = row[0].salt;
        //id, 비밀번호 일치할 경우
        if (idcheck == id && encryptedPW == makePW.comparePW(salt, password)) {
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

/**
 * 관리자 페이지 비밀번호 변경
 * 
 * @module adminChangePW
 * 
 * @param {string} password - req
 * @param {string} passwordcheck - req
 * 
 */
router.post('/changePW', function (req, res, next) {
    let body = req.body;
    let pw = body.password;
    let pwcheck = body.passwordcheck;

    // pw, pwcheck이 다를 경우
    if (pw != pwcheck) {
        res.render('admin_alert', {
            alert_type: "비밀번호 변경 실패",
            alert_details: "일치하지 않음"
        });
    } 
    else {
        let protectedPW = makePW.createPW(pw);

        //랜덤한 비밀번호로 변경
        let query = "update admin set password = ?, salt = ? where ID = ?"
        connection.query(query, [protectedPW[1], protectedPW[0], 'projectQ#!@'], function (err, row) {
            if (err) {
                throw err
            };
            res.render('admin_alert', {
                alert_type: "비밀번호 변경 성공",
                alert_details: ""
            });
        })
    }
});

/* 상품 추가 페이지 이동 */
router.post('/addProductPage', function (req, res, next) {
    res.render('admin_addProduct');
});

/* 상품 관리 페이지 이동 */
router.post('/alertToAdminPage', function (req, res, next) {
    let productlist = [];

    // 상품 정보들 전부 가져오기
    let query = "select p_ID, p_name, img_logo from product";
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