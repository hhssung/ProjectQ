//관리자 전용 페이지

const express = require('express');
const router = express.Router();

const dbconnect = require("../config/database");
const connection = dbconnect.init();

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
        console.log(idcheck);
        console.log(pwcheck);
        //id, 비번 일치
        if(idcheck==id && pwcheck==password)
        {
            res.render('admin_page');
        }
        //불일치
        else{
            res.json({
                res: "id or pw mismatch"
            });
        }
    })
});





module.exports = router;