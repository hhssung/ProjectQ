/* 메일 전송 모듈 */

const nodemailer = require('nodemailer');
const mymail = require('../config/mymail');

const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: mymail.mailer.user,
        pass: mymail.mailer.password
    },
    tls: {
        rejectUnauthorized: false
    }
});

//메일 전송
function send_email(receiver_email, modified_pw) {
    let mailOptions = {
        from: mymail.mailer.user,
        to: receiver_email,
        subject: '[Qmoment] 비밀번호 변경',
        html: `Qmoment 비밀번호 변경 안내<br/>
        비밀번호가 변경되었습니다. 마이페이지에서 다시 비밀번호를 변경해 주세요!<br/>
        <span style='font-size: 1.5em; color: red;'>${modified_pw}</span><br/>
        감사합니다!`
    }
    transport.sendMail(mailOptions, function (err, info) {
        if (err) {
            console.log(err);
        } else {
            console.log('email sent' + info.response);
        }
    })
}

module.exports = send_email;