//관리자 전용 페이지

const express = require('express');
const router = express.Router();

const dbconnect = require("../config/database");
const connection = dbconnect.init();

/* 관리자 페이지 첫화면 */
router.get('/', function (req, res, next) {
    res.render('admin');
});

module.exports = router;