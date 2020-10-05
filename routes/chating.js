/* user가 채팅을 했을 경우 3분 뒤 응답을 보내기 위해 정보 저장 */

const express = require('express');
const router = express.Router();

const dbconnect = require("../config/database");
const connection = dbconnect.init();

const variables = require('../my_modules/var');

const jwt = require("jsonwebtoken");
const jwtobj = require("../config/jwt");

let info = new Object();

/**
 * 3분 뒤 해당 token으로 push알림 보내기 위해 array에 정보 저장
 * 
 * @module chating
 * 
 * @param {string} token - req
 * @param {string} q_ID - req
 * @param {string} message - req
 * 
 */
router.post('/', function (req, res) {
    let body = req.body;
    let token = body.token;
    let q_ID = body.q_ID;
    let message = body.message;

    let date = new Date();
    let hour = date.getHours();
    let minutes = date.getMinutes();

    for (let i=0; i<variables.chatArray.length; i++)
    {
        //3분이 되기 전 똑같은 곳에서 다시 메시지가 날아올 경우 해당 인덱스 삭제
        if(token == variables.chatArray[i].token && q_ID == variables.chatArray[i].q_ID)
        {
            variables.chatArray.splice(i,1);
        }
    }

    minutes += 1;
    variables.chatArray.push({token, q_ID, message, hour, minutes});
    
    console.log(variables.chatArray);
    res.json({
        res: "success"
    })
})




module.exports = router;