//관리자 전용 페이지

const express = require('express');
const router = express.Router();

const dbconnect = require("../config/database");
const connection = dbconnect.init();

const upload = require('../my_modules/upload');
var variables = require('../my_modules/var');

/////////////////////////////
// 관리자 페이지 로그인 화면 //
/////////////////////////////
router.get('/', function (req, res, next) {
    res.render('admin_login');
});

///////////////////////////
//관리자 페이지 로그인 시도//
///////////////////////////
router.post('/login', function (req, res, next) {
    let body = req.body;
    let id = body.id;
    let password = body.password;

    //id, 비번 확인
    let query1 = "select * from admin";
    connection.query(query1, function (err, row) {
        if (err) {
            throw err
        };
        let idcheck = row[0].ID;
        let pwcheck = row[0].password;
        //id, 비번 일치
        if (idcheck == id && pwcheck == password) {
            //상품들의 고유 id, 이름 읽어오기
            let query2 = "select p_ID, p_name, img_logo from product";
            let productlist = [];
            //비동기 처리
            new Promise((resolve, reject) => {
                connection.query(query2, function (err, row_2) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row_2);
                    }
                });
            }).then(row_2 => { //성공시
                for (let i = 0; i < row_2.length; i++) {
                    let product = {
                        'img_logo': row_2[i].img_logo,
                        'product_name': row_2[i].p_name,
                        'product_id': row_2[i].p_ID
                    }
                    productlist.push(product);
                }
                console.log(productlist);
                res.render('admin_page', {
                    'productlist': productlist
                });
            }).catch(err => { //실패시
                throw err;
            });
        }
        //불일치
        else {
            res.json({
                res: "id or pw mismatch"
            });
        }
    })
});

//////////////
// 상품 삭제 //
//////////////
router.post('/delete_product', function (req, res, next) {
    let body = req.body;
    console.log(body);

    res.render('index', {
        title: "del"
    });
});


/////////////////////////
// 상품 추가 페이지 이동//
/////////////////////////
router.post('/add_product_page', function (req, res, next) {
    res.render('admin_addProduct');
});


//////////////
// 상품 추가 //
//////////////
router.post('/add_product', upload.fields(variables.file_names), function (req, res, next) {
    let body = req.body;
    let p_name = body.p_name;
    let p_intro = body.p_intro;
    let push_type = body.push_type;
    let start_time = body.start_time;
    let finish_time = body.finish_time;

    // 파일 저장된 경로 받아오기
    let p_excel = req.files.p_excel[0].filename;
    let p_logo = req.files.p_logo[0].filename;
    let p_background = req.files.p_background[0].filename;
    let p_explain = req.files.p_explain[0].filename;





    // 내일 할 것: 파일 링크 받아와서 upload 폴더에 각각 복사해서 저장. (multer 이용)
    // 그 후 db에 각 사진들, 엑셀의 upload 폴더의 링크 저장
    // https://victorydntmd.tistory.com/39
    // 이후 엑셀 파싱해서 db의 question 영역에 저장

    res.json({
        hello: 'hello'
    })
});

/*
상품명: p_name
상품로고: p_logo
배경사진: p_background
설명사진: p_explain
설명: p_intro
푸시: push_type  - no_ran 이나 ran으로 받아옴
시작시간: start_time
끝시간: finish_time
엑셀: p_excel
*/
module.exports = router;