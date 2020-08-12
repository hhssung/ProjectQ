//관리자 전용 페이지

const express = require('express');
const router = express.Router();

const dbconnect = require("../config/database");
const connection = dbconnect.init();

const upload = require('../my_modules/upload');
const variables = require('../my_modules/var');

const XLSX = require('xlsx');

// 13:59:30 같은 시간을 1359로 가공해주는 함수
function parsetime(p_time) {
    return p_time.substring(0, 5).replace(":", "");
}

//////////////
// 상품 추가 //
//////////////
router.post('/', upload.fields(variables.file_names), function (req, res, next) {
    let body = req.body;
    let p_name = body.p_name;
    let p_intro = body.p_intro;
    let push_type = body.push_type;
    let start_time = body.start_time;
    let end_time = body.end_time;

    // 파일 저장된 경로 받아오기
    let p_logo = req.files.p_logo[0].filename;
    let p_background = req.files.p_background[0].filename;
    let p_explain = req.files.p_explain[0].filename;
    let p_excel = req.files.p_excel[0].filename;

    start_time = parsetime(start_time);
    end_time = parsetime(end_time);

    let query_inputs = {
        p_ID: 0,
        p_name: p_name,
        img_logo: p_logo,
        img_background: p_background,
        img_explain: p_explain,
        excel: p_excel,
        p_intro: p_intro,
        pushType: push_type,
        start_time: start_time,
        end_time: end_time
    }

    let query2_inputs = [];

    //product table에 상품 집어넣기
    function insertProduct() {
        return new Promise((resolve, reject) => {
            let query = "insert into product SET ?"
            connection.query(query, query_inputs, function (err, row) {
                if (err) {
                    reject(err);
                } else {
                    let workbook = XLSX.readFile(__dirname + "/../upload/" + p_excel);
                    let worksheet = workbook.Sheets["Sheet1"];
                    const jsondata = XLSX.utils.sheet_to_json(worksheet);

                    // question table에 넣을 수 있게 가공
                    for (let i = 0; i < jsondata.length; i++) {
                        query2_inputs.push([0, row.insertId, jsondata[i].num, jsondata[i].content]);
                    }

                    resolve();
                }
            })
        })
    }

    // question table에 질문들 집어넣기
    function insertQuestions() {
        return new Promise((resolve, reject) => {
            let query2 = "insert into question values ?";
            connection.query(query2, [query2_inputs], function (err, row) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            })
        })
    }

    insertProduct()
        .then(insertQuestions)
        .then(() => { // 알림페이지로 가기
            res.render('admin_alert', {
                alert_type: "상품 추가 성공!!!",
                alert_details: ""
            });
        })
        .catch(err => { //실패시
            throw err;
        });
});

module.exports = router;