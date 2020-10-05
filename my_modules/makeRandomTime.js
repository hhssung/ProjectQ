const {
    Expo
} = require('expo-server-sdk');

const expo = new Expo();

const schedule = require('node-schedule');

const dbconnect = require('../config/database');
const variables = require('./var');
const connection = dbconnect.init();

let time235910 = new schedule.RecurrenceRule();
// time235910 = '*/20 * * * * *';

// 23h 에서 9 빼야 됨
time235910.dayOfWeek = [0, new schedule.Range(0, 6)];
time235910.hour = 14;
time235910.minute = 59;
time235910.second = 10;

let time00 = new schedule.RecurrenceRule();
//time00 = '0 * * * * *';
time00 = '0 * * * * *';

let time30 = new schedule.RecurrenceRule();
time30 = '30 * * * * *';



/**
 * 랜덤한 시간 만들기
 * 
 * @function setRandomTime
 * 
 * @param {string} starttime - hhmm
 * @param {string} endtime - hhmm
 * @return {string} 시작 시간과 끝 시간 사이 랜덤한 값 - hhmm
 * 
 */
function setrandomtime(starttime, endtime) {
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

/**
 * hhmm 형태로 시간 가공하기
 * 한국 시간으로 바꾸기
 * 
 * @function getFormatClock
 * 
 * @param {date} date 
 * @return {string} hhmm
 * 
 */
function getFormatClock(date) {
    var hour = date.getHours(); //h
    hour += 9;
    hour = hour > 24 ? hour-24 : hour ;
    hour = hour >= 10 ? hour : '0' + hour; //hour 두자리로 저장
    var minutes = date.getMinutes(); //m
    minutes = minutes >= 10 ? minutes : '0' + minutes; //minute 두자리로 저장
    return '' + hour + minutes;
}

/**
 * 매 00초마다 실행되는 함수. 
 * DB에서 시간 정보 불러와 푸시알람 보내기
 * 
 * @function sendPushAlarm
 * 
 */
function sendPushAlarm() {
    const today = new Date();
    var now_time = getFormatClock(today);
    console.log(now_time);
    let tokens = [];
    let emails = [];
    let notifications = [];
    let p_ID = [];
    let d_ID = [];

    console.log(now_time);

    //현재 시간과 일치하는 알림 시간 및 토큰 전부 찾기, NULL 토큰 제외
    function selectAlarmTime() {
        return new Promise((resolve, reject) => {
            let query = "select pushtoken, email, fproduct_ID, fdiary_ID from user inner join chatSubscribing on email = femail where chatalarm_time = ? and pushtoken is not null"
            connection.query(query, now_time, function (err, row) {
                if (err) {
                    reject(err);
                } else {
                    for (let i = 0; i < row.length; i++) {
                        tokens.push(row[i].pushtoken);
                        emails.push(row[i].emails);
                        p_ID.push(row[i].fproduct_ID);
                        d_ID.push(row[i].fdiary_ID);
                    }
                    resolve();
                }
            })
        })
    }

    // 해당 기기로 토큰 전송
    function sendToken() {
        return new Promise((resolve, reject) => {
            for (let i = 0; i < tokens.length; i++) {
                if (!Expo.isExpoPushToken(tokens[i])) {
                    console.error(`Push token ${tokens[i]} is not a valid Expo push token`);
                    continue;
                }
                notifications.push({
                    to: tokens[i],
                    sound: 'default',
                    title: '당신만의 일기를 써 보세요!',
                    body: now_time + "에 새로운 알림 도착~",
                    data: {
                        p_ID: p_ID[i],
                        d_ID: d_ID[i]
                    }
                })
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

    selectAlarmTime()
        .then(sendToken)
        .catch(err => {
            throw err
        })

    //console.log(now_time);
}

/**
 * 23:59:10 마다 DB 정보 랜덤한 시간으로 바꾸기
 * 사용자 많아지면 이런거 여러개 만들어서 5초마다 순차적으로 push 할 수 있게 해야될듯
 * 
 * @function changeAlarmTime
 * 
 */
function changeAlarmTime() {
    let femail = [];
    let fproduct_ID = [];
    let new_chatalarm_time = [];
    console.log(variables.chatArray);
    function selectRandomType() {
        return new Promise((resolve, reject) => {
            let query = "select * from chatSubscribing where chatstart_time != chatend_time";
            connection.query(query, function (err, row) {
                if (err) {
                    reject(err);
                } else {
                    for (let i = 0; i < row.length; i++) {
                        femail[i] = row[i].femail;
                        fproduct_ID[i] = row[i].fproduct_ID;
                        new_chatalarm_time[i] = setrandomtime(row[i].chatstart_time, row[i].chatend_time);
                    }
                    resolve();
                }
            })
        })
    }

    function updateRandomTime() {
        return new Promise((resolve, reject) => {
            let query2 = "UPDATE chatSubscribing SET chatalarm_time = ? WHERE femail=? and fproduct_ID = ?";
            for (let j = 0; j < femail.length; j++) {
                connection.query(query2, [new_chatalarm_time[j], femail[j], fproduct_ID[j]], function (err, row2) {
                    if (err) {
                        reject(err);
                    } else {
                        //console.log(row2);
                    }
                })
            }
            resolve();
        })
    }
    selectRandomType()
        .then(updateRandomTime)
        .catch(err => {
            throw err
        })
    
}


/**
 * 매 분 0초마다 실행
 * 채팅한 뒤 3분 뒤에 푸시알림 전송
 * 
 * @function chatingPushAlarm
 * 
 */
function chatingPushAlarm() {
    let date = new Date();
    let hour = date.getHours();
    let minutes = date.getMinutes();
    let tokens = [];
    let q_ID = [];
    let message = [];
    let notifications = [];

    function getTime() {
        return new Promise((resolve, reject) => {
            for (let i = 0; i < variables.chatArray.length; i++) {
                if (variables.chatArray[i].hour == hour && variables.chatArray[i].minutes == minutes) {
                    tokens.push(variables.chatArray[i].token);
                    q_ID.push(variables.chatArray[i].q_ID);
                    message.push(variables.chatArray[i].message);
                } else {
                    //선택 된 시간대 0개
                    if (tokens.length == 0) {
                        break;
                    }
                    //선택 된 시간대 제외 전부 삭제
                    else{
                        variables.chatArray.splice(0, i+1);
                        break;
                    }
                }
            }
            // console.log('!!!!!!!!');
            // console.log(tokens);
            // console.log(q_ID);
            // console.log(message);
            resolve();
        })
    }

    // 해당 기기로 토큰 전송
    function sendToken() {
        return new Promise((resolve, reject) => {
            for (let i = 0; i < tokens.length; i++) {
                if (!Expo.isExpoPushToken(tokens[i])) {
                    console.error(`Push token ${tokens[i]} is not a valid Expo push token`);
                    continue;
                }
                notifications.push({
                    to: tokens[i],
                    sound: 'default',
                    title: '답장이 왔어요!',
                    body: message[i],
                    data: {
                        q_ID: q_ID
                    }
                })
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

    getTime()
        .then(sendToken)
        .catch(err => {
            throw err
        })

}

/**
 * 스케줄러
 * 
 * @module schedules
 * 
 * @function makeRandomTime - 매일 23:59:10 마다 changeAlarmTime() 실행
 * @function makePushAlarm - 매 분마다 sendPushAlarm() 실행
 * 
 */
const schedules = {
    makeRandomTime: schedule.scheduleJob(time235910, () => {
        changeAlarmTime();
        console.log("Every Day 23:59:10 Random time setting !!!!!!!!!!");
    }),
    makePushAlarm: schedule.scheduleJob(time30, () => { //매 분 30초마다 실행
        sendPushAlarm();
        console.log("makePushAlarm: " + Date.now());
    }),
    callBackToChating: schedule.scheduleJob(time00, () => { //매 분 0초마다 실행
        chatingPushAlarm();
        console.log("callBackToChating: " + Date.now());
    })
}

module.exports = schedules;