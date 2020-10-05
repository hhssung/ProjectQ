/* 다이어리 html, pdf 만드는 모듈 */

const express = require('express');
const router = express.Router();

const dbconnect = require("../config/database");
const connection = dbconnect.init();

const fs = require('fs');
//const pdf = require('html-pdf');
const variables = require('../my_modules/var');

const jwt = require("jsonwebtoken");
const jwtobj = require("../config/jwt");

/**
 * 랜덤한 링크 생성
 * 
 * @function makeRandomLink
 * 
 * @return {string} randomString
 * 
 */
function makeRandomLink() {
    var randomString = Date.now() + Math.random().toString(36).substr(3, 9);
    return randomString;
}

/**
 * 링크 주소 만들기
 * 
 * @function makeLinkToAddress
 * 
 * @param {string} str
 * @return {string} linkAddress
 * 
 */
function makeLinkToAddress(str) {
    var linkAddress = variables.server_links + str + ".html";
    return linkAddress;
}

/**
 * pdf 주소 만들기
 * 
 * @function makePdfToAddress
 * 
 * @param {string} str
 * @return {string} linkAddress
 * 
 */
function makePdfToAddress(str) {
    var pdfAddress = variables.server_pdfs + str + ".pdf";
    return pdfAddress;
}

/**
 * 파일 삭제하는 함수
 * 
 * @function deleteFiles
 * 
 * @param {Object} files -  {filepath, filepath, filepath, ... }
 * 
 */
function deleteFiles(files, callback) {
    var i = files.length;
    files.forEach(function (filepath) {
        fs.unlink(filepath, function (err) {
            i--;
            if (err) {
                callback(err);
                return;
            } else if (i <= 0) {
                callback(null);
            }
        });
    });
}

/**
 * time => 08<br>13 형태로 가공하기
 * 
 * @function dateToHtml
 * 
 * @param {date()} time 
 * @return {string} MM<br>dd
 * 
 */
function dateToHtml(time) {
    var month = (1 + time.getMonth()); //M
    var day = time.getDate(); //d
    month = month >= 10 ? month : '0' + month;
    day = day>=10 ? day : '0'+day;
    //fulltime -> MMdd 형태로 가공
    var html = ''+month + '<br>' + day;
    return html;
}

/**
 * time => 오후 4시 38분 형식으로 바꾸기
 * 
 * @function timeToHtml
 * 
 * @param {date()} time
 * @return {string} '오후 4시 38분'
 * 
 */
function timeToHtml(time) {
    var hour = (1 + time.getHours()); //h
    var minutes = time.getMinutes(); //m
    if (hour >= 12) {
        return '오후 ' + (hour - 12) + '시 ' + minutes + '분';
    } else {
        return '오전 ' + hour + '시 ' + minutes + '분';
    }
}

/**
 * html 만들기
 * 
 * @function buildHtml
 * 
 * @param {string} name
 * @param {Object} contents
 * @param {Object} times    //2020-09-02T07:59:09.172Z
 * @return {string} fullHTML
 * 
 */
function buildHtml(name, contents, times, pdfType) {
    var header = '';
    var body = '';
    var css = variables.makelink_css;

    header += (name + ' 님의 다이어리');
    // for (let i = 0; i < contents.length; i++) {
    //     body += ('<p>' + contents[i] + '</p>')
    // }

    body += '<table>';
    for (let i = 0; i < contents.length; i++) {
        let temp = new Date(times[i]);
        body += '<tr>';
        body += '<td id="date">' + dateToHtml(temp) + '</td>';
        body += '<td id="contents">' + contents[i] +
            '<br><div id = "time">' + timeToHtml(temp) + '</div></td>';
        body += '</tr>';
    }
    body += '</table>';

    var fullHTML;
    
    // 웹 링크용 HTML
    if(pdfType==0)
    {
        fullHTML = '<!DOCTYPE html>' +
        '<html><head>' +
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
        '<link rel="stylesheet" href="' + variables.server_css + 'link.css" />' +
        '<link rel="stylesheet" media="(max-width: 768px)" href="' + variables.server_css + 'mobilelink.css" /><h1>' +
        header +
        '</h1></head><body>' +
        body +
        '</body></html>';
    }
    // PDF용 HTML
    else{
        fullHTML = '<!DOCTYPE html>' +
        '<html><head>' +
        '<meta name="viewport" content="width=device-width, initial-scale=1.0"> <style type="text/css">'+css+'</style><h1>' +
        header +
        '</h1></head><body>' +
        body +
        '</body></html>';
    }

    return fullHTML;
}

/**
 * html 링크 주소 or pdf 링크 주소 반환
 * 
 * @module makelink
 * 
 * @param {Object} JWT - req
 * @param {int} d_ID - req
 * @param {boolean} pdfType - 0: html, 1: pdf, req
 * 
 */
router.post('/', function (req, res) {
    //jwt 토큰 받기
    //let token = req.cookies.user;
    let token = req.body.jwt;
    let d_ID = req.body.d_ID;
    let pdfType = req.body.pdfType;

    let decoded = jwt.verify(token, jwtobj.secret);

    if (decoded) {
        let email = decoded.email;
        let linkname; //DB에 저장될 값
        let myname;
        let html;

        //링크 이미 존재하는지, 존재하지 않는지 확인 + 이름까지 가져오기
        function getLinkName() {
            return new Promise((resolve, reject) => {
                let query = "select Uname, linkname from diary inner join chatSubscribing on d_ID = fdiary_ID inner join user on email = femail where d_ID = ?";
                connection.query(query, d_ID, function (err, row) {
                    if (err) {
                        reject(err);
                    } else {
                        if (row.length > 0) {
                            linkname = row[0].linkname;
                            myname = row[0].Uname;
                            resolve();
                        } else {
                            reject("no link");
                        }
                    }
                })
            })
        };

        //html 링크 만들기 or 기존에 있던 파일 삭제하기
        function makeHtmlLink() {
            return new Promise((resolve, reject) => {
                // 링크 없을경우 새로운 링크 만들기
                if (linkname == 'nolink') {
                    linkname = makeRandomLink();
                    //새로운 링크 DB에 정보 집어넣기
                    let query = "UPDATE diary SET linkname = ? WHERE d_ID = ?"
                    connection.query(query, [linkname, d_ID], function (err, row) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    })
                    resolve();
                }
                // 기존 링크 존재, 삭제 후 새로 만들기
                else {
                    let filepath = __dirname + "/../links/" + linkname + ".html";
                    var files = [];
                    files.push(filepath);
                    //파일 삭제
                    deleteFiles(files, function (err) {
                        if (err) {
                            console.log(err);
                            reject("no files");
                        } else {
                            console.log('all files removed');
                        }
                    });
                    resolve();
                }

            })
        };

        let chatContents = [];
        let chatedTime = [];

        //DB에서 채팅 내역 가져오기
        function getChatContent() {
            return new Promise((resolve, reject) => {
                let query = "select * from diaryMessage WHERE fd_ID = ?"
                connection.query(query, d_ID, function (err, row) {
                    if (err) {
                        reject(err);
                    } else {
                        for (let i = 0; i < row.length; i++) {
                            chatContents.push(row[i].chatcontent);
                            chatedTime.push(row[i].chatedtime);
                        }
                        resolve();
                    }
                })
            })
        }

        //링크에 html 파일 저장하기
        function makeHtmlFile() {
            return new Promise((resolve, reject) => {
                var fileName = 'links/' + linkname + '.html';
                var stream = fs.createWriteStream(fileName);

                stream.once('open', function (fd) {
                    html = buildHtml(myname, chatContents, chatedTime, pdfType);
                    stream.end(html);
                    resolve();
                })
            })
        }

        //html pdf로 변환
        function htmlToPdf() {
            return new Promise((resolve, reject) => {
                // html만 뱉어주는 경우
                if (pdfType == 0) {
                    resolve();
                }
                // pdf로 바꿔야 하는 경우
                else {
                    var options = {
                        "height": "320px",
                        "width": "320px",
                    };
                    pdf.create(html, options).toFile(__dirname + '/../pdfs/' + linkname + '.pdf', function (err, res) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                }
            })
        }

        getLinkName()
            .then(makeHtmlLink)
            .then(getChatContent)
            .then(makeHtmlFile)
            //.then(htmlToPdf)
            .then(() => {
                // html 주소만 내보낼 경우
                if (pdfType == 0) {
                    res.json({
                        'linkname': makeLinkToAddress(linkname)
                    })
                }
                // pdf로 바꿔야 하는 경우
                else {
                    res.json({
                        'htmls': html
                    })
                }
            })
            .catch(err => {
                console.log(err);
                res.json({
                    res: "fail"
                })
            });
    } else {
        res.json({
            res: 'noAuth'
        });
    }
});



module.exports = router;
