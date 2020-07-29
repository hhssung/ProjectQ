//사용자 다이어리 관련

const express = require('express');
const router = express.Router();

const dbconnect = require("../config/database");
const connection = dbconnect.init();

const jwt = require("jsonwebtoken");
const jwtobj = require("../config/jwt");

const variables = require('../my_modules/var');

//////////////////////////
// 내가 쓴 다이어리 조회 //
//////////////////////////
router.post('/lookup', function (req, res) {
    //jwt 토큰 받기
    let token = req.cookies.user;

    
    
});

module.exports = router;