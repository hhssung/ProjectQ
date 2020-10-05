const {
    Expo
} = require('expo-server-sdk');

const expo = new Expo();

/*
const HTTP = 'http://7add0d616f36.ngrok.io';
const PUSH_REGISTRATION_ENDPOINT = HTTP+'/pushalarm/token';
const MESSAGE_ENPOINT = HTTP+'pushalarm/message';
*/

var express = require('express');
var router = express.Router();

const dbconnect = require("../config/database");
const connection = dbconnect.init();

let savedPushTokens = [];

// 토큰 DB에 저장
const saveToken = (token, email) => {
    console.log("token: ", token);
    console.log("email: ", email);
    let query = "UPDATE user SET pushtoken = ? where email = ?"
    connection.query(query, [token.data, email], function (err, row) {
        if (err) {
            throw err;
        } else {
            console.log(email + " : updated!");
        }
    })
};

// 모든 등록된 사용자에게 전송
const handlePushTokens = (message) => {
    let notifications = [];
    let savedPushTokens = [];

    // 모든 사용자의 토큰 받기
    function getToken() {
        return new Promise((resolve, reject) => {
            let query = "select pushtoken from user where pushtoken is not NULL"
            connection.query(query, function (err, row) {
                if (err) {
                    reject(err);
                } else {
                    for (let i = 0; i < row.length; i++) {
                        savedPushTokens.push(row[i].pushtoken);
                    }
                    resolve();
                }
            })
        })
    }

    // 토큰 전송
    function sendToken() {
        return new Promise((resolve, reject) => {
            for (let pushToken of savedPushTokens) {
                if (!Expo.isExpoPushToken(pushToken)) {
                    console.error(`Push token ${pushToken} is not a valid Expo push token`);
                    continue;
                }
                notifications.push({
                    to: pushToken,
                    sound: 'default',
                    title: message + " : 전송!",
                    body: message,
                    data: {
                        message
                    }
                })
                console.log("123123123");
            }
            let chunks = expo.chunkPushNotifications(notifications);
            (async () => {
                for (let chunk of chunks) {
                    try {
                        let receipts = await expo.sendPushNotificationsAsync(chunk);
                        console.log(receipts);
                    } catch (err) {
                        console.error(err);
                    }
                }
            })()
            resolve();
        })
    }

    getToken()
        .then(sendToken)
        .catch(err => {
            throw err
        })
}

// function makePushAlarmData() {
//   var note = new apn.Notification();
//   note.expiry = Math.floor(Date.now() / 1000) + 3600;
//   note.badge = 3;
//   //note.sound = "ping.aiff";
//   note.alert = "TESTTESTTESTTESTTEST";
//   note.payload = {
//     "messageFrom": "Qmoment"
//   };
//   note.topic = "Qmoment";
//   return note;
// }

/* GET TOKEN */
router.post('/token', (req, res) => {
    console.log(`Received push token, ${req.body.token.value}`);
    console.log(`Received email, ${req.body.user.email}`);
    saveToken(req.body.token.value, req.body.user.email);
    res.send(`Received push token, ${req.body.token.value}`);
});

/* GET MESSAGE */
router.post('/message', (req, res) => {
    handlePushTokens(req.body.message);
    console.log(`Received message, ${req.body.message}`);
    res.send(`Received message, ${req.body.message}`);
});

/* push test */
router.get('/', function (req, res, next) {
    // let note = makePushAlarmData();
    // apn_provider.send(note, deviceToken).then(function (result) {
    //   console.log("결과: " + result);
    // }).catch(function (err) {
    //   throw err
    // })
});

module.exports = router;