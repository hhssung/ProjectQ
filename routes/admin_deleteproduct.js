//관리자 전용 페이지

const express = require('express');
const router = express.Router();

const qs = require('querystring');
const fs = require('fs');

const dbconnect = require("../config/database");
const connection = dbconnect.init();

//파일 삭제하는 함수
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

//query에 넣을수 있게 p_id 가공하는 함수
function makePID(p_id) {
    let makepid;
    if (p_id.length == 0) {
        return ""
    }
    //배열의 길이가 1일 경우
    else if (!Array.isArray(p_id)) {
        return p_id;
    } else {
        makepid = p_id[0];
        for (let i = 1; i < p_id.length; i++) {
            makepid = makepid + "," + p_id[i];
        }
        return makepid;
    }
}

//////////////
// 상품 삭제 //
//////////////
router.post('/', function (req, res, next) {
    let body = req.body;
    let deletecheck = body.deletecheck;
    let p_id = body.productID;

    if (deletecheck != "삭제하겠습니다") {
        res.render('admin_alert', {
            alert_type: "상품 삭제 실패",
            alert_details: "\"삭제하겠습니다\"를 정확히 입력해 주세요."
        });
    } else {
        //p_id ?,?,? 형태로 가공
        let makepid = makePID(p_id);

        //파일 불러오고 삭제
        function importFileAndDelete() {
            return new Promise((resolve, reject) => {
                //파일 이름 불러오는 쿼리
                let query = "select img_logo, img_background, img_explain, excel from product where product.p_ID in (" + makepid + ")";
                connection.query(query, function (err, row) {
                    if (err) {
                        reject(err);
                    } else {
                        var files = [];
                        let filepath = __dirname + "/../upload/";
                        for (let j = 0; j < row.length; j++) {
                            files.push(filepath + row[j].img_logo);
                            files.push(filepath + row[j].img_background);
                            files.push(filepath + row[j].img_explain);
                            files.push(filepath + row[j].excel);
                        }
                        //파일 삭제
                        deleteFiles(files, function (err) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log('all files removed');
                            }
                        });
                        resolve();
                    }
                })
            })
        }

        function deleteProducts() {
            return new Promise((resolve, reject) => {
                //question, product 삭제하는 쿼리
                let query2 = "delete product from product inner join question on product.p_ID = question.fp_ID where question.fp_ID in (" + makepid + ")";
                connection.query(query2, function (err, row2) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                })
            })
        }

        importFileAndDelete()
            .then(deleteProducts)
            .then(() => {
                res.render('admin_alert', {
                    alert_type: "상품 삭제 성공!!!",
                    alert_details: ""
                });
            })
            .catch(err => {
                throw err;
            });
    }
});

module.exports = router;