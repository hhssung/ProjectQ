//상품 조회

const express = require('express');
const router = express.Router();

const dbconnect = require("../config/database");
const connection = dbconnect.init();

const fs = require('fs');
const pdf = require('html-pdf');
const variables = require('../my_modules/var');

const jwt = require("jsonwebtoken");
const jwtobj = require("../config/jwt");

//랜덤한 링크 만들기
function makeRandomLink() {
    var randomString = Math.random().toString(36).substr(3, 9);
    return Date.now() + randomString;
}

//링크 주소 만들기
function makeLinkToAddress(str) {
    return variables.server_links + str + ".html";
}

//pdf 주소 만들기
function makePdfToAddress(str) {
    return variables.server_pdfs + str + ".pdf";
}

//파일 삭제하기
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

//html 만들기
function buildHtml(name, contents) {
    var header = '';
    var body = '';

    header += (name + ' 님의 다이어리 입니다!!!');
    for (let i = 0; i < contents.length; i++) {
        body += ('<p>' + contents[i] + '</p>')
    }

    // concatenate header string
    // concatenate body string

    return '<!DOCTYPE html>' +
        '<html><head><h1>' + header + '</h1></head><body>' + body + '</body></html>';
}

//////////////
// 링크 배포 //
//////////////

// DB에 다이어리 링크 이미 존재 => 다이어리 html 삭제 후 그 주소로 새로 생성
// DB에 없음 => 새로 만들기
router.post('/', function (req, res) {
    //jwt 토큰 받기
    let token = req.cookies.user;
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
                // 링크 x, 새로운 링크 만들기
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

        //DB에서 채팅 내역 가져오기
        function getChatContent() {
            return new Promise((resolve, reject) => {
                let query = "select chatcontent from chating WHERE fd_ID = ?"
                connection.query(query, d_ID, function (err, row) {
                    if (err) {
                        reject(err);
                    } else {
                        let chatContents = [];
                        for (let i = 0; i < row.length; i++) {
                            chatContents.push(row[i].chatcontent);
                        }
                        resolve(chatContents);
                    }
                })
            })
        }

        //링크에 html 파일 저장하기
        function makeHtmlFile(chatContents) {
            return new Promise((resolve, reject) => {
                var fileName = 'links/' + linkname + '.html';
                var stream = fs.createWriteStream(fileName);

                stream.once('open', function (fd) {
                    html = buildHtml(myname, chatContents);
                    stream.end(html);
                    resolve();
                })
            })
        }

        function htmlToPdf() {
            return new Promise((resolve, reject) => {
                // html만 뱉어주는 경우
                if (pdfType == 0) {
                    resolve();
                }
                // pdf로 바꿔야 하는 경우
                else {
                    var options = {
                        format: 'Letter'
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
            .then(htmlToPdf)
            .then(() => {
                // html만 뱉어주는 경우
                if (pdfType == 0) {
                    res.json({
                        'linkname': makeLinkToAddress(linkname)
                    })
                }
                // pdf로 바꿔야 하는 경우
                else {
                    res.json({
                        'pdfname': makePdfToAddress(linkname)
                    })
                }
            })
            .catch(err => {
                res.json({
                    res: "failed"
                })
                console.log(err);
            });
    } else {
        res.json({
            res: '권한 없음'
        });
    }
});



module.exports = router;