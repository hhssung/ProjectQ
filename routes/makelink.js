//상품 조회

const express = require('express');
const router = express.Router();

const dbconnect = require("../config/database");
const connection = dbconnect.init();

const fs = require('fs');
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

//////////////
// 링크 배포 //
//////////////

// DB에 다이어리 링크 이미 존재 => 다이어리 html 삭제 후 그 주소로 새로 생성
// DB에 없음 => 새로 만들기
router.post('/', function (req, res) {
    //jwt 토큰 받기
    let token = req.cookies.user;
    let d_ID = req.body.d_ID;
    let decoded = jwt.verify(token, jwtobj.secret);

    if (decoded) {
        let email = decoded.email;
        let linkname; //DB에 저장될 값

        //링크 이미 존재하는지, 존재하지 않는지 확인
        function getLinkName() {
            return new Promise((resolve, reject) => {
                let query = "select linkname from diary where d_ID = ?";
                connection.query(query, d_ID, function (err, row) {
                    if (err) {
                        reject(err);
                    } else {
                        if(row.length > 0)
                        {
                            linkname = row[0].linkname;
                            resolve();
                        }else{
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
                }
                // 기존 링크 존재, 삭제 후 새로 만들기
                else {
                    let filepath = __dirname + "/../links/";
                    var files = [];
                    files.push(linkname);
                    //파일 삭제
                    deleteFiles(files, function (err) {
                        if (err) {
                            console.log(err);
                            reject("no files");
                        } else {
                            console.log('all files removed');
                        }
                    });
                }
                resolve();
            })
        };

        //링크에 html 파일 저장하기
        function makeHtmlFile() {
            return new Promise((resolve, reject) => {
                

                resolve();
            })
        }

        getLinkName()
            .then(makeHtmlLink)
            .then(makeHtmlFile)
            .then(() => {
                res.json({
                    res: makeLinkToAddress(linkname)
                })
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