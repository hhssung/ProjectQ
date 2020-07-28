//상품 조회

const express = require('express');
const router = express.Router();

const dbconnect = require("../config/database");
const connection = dbconnect.init();

const variables = require('../my_modules/var');

//////////////
// 상품 조회 //
//////////////
router.post('/lookup', function (req, res) {
    


});