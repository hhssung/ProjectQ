//관리자 전용 페이지

const express = require('express');
const router = express.Router();

const qs = require('querystring');

const dbconnect = require("../config/database");
const connection = dbconnect.init();

//////////////
// 상품 삭제 //
//////////////
//question 삭제 -> product 정보 불러오기, 사진 삭제 -> product 삭제
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
        // 파일 저장된 위치
        let p_logo;
        let p_background;
        let p_explain;
        let p_excel;

        //p_id 가공
        let makepid = makePID(p_id);

        // questions 삭제
        let query = "delete from question where fp_ID in ("+makepid+")";
        console.log(makepid);

        var delete_questions = new Promise((resolve, reject) => {
            connection.query(query, function (err, row) {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            })
        })

        delete_questions.then((row)=>{
            res.render('admin_alert', {
                alert_type: "상품 삭제 성공!!!",
                alert_details: ""
            });
        }).catch(err=>{
            throw err;
        });

    }
});

//query에 넣을수 있게 p_id 가공하는 함수
function makePID(p_id){
    let makepid;
    if(p_id.length==0)
    {
        return ""
    }else if(p_id.length==1)
    {
        return p_id[0];
    }else{
        makepid=p_id[0];
        for(let i=1; i<p_id.length; i++)
        {
            makepid = makepid + "," + p_id[i];
        }
        return makepid;
    }
}

module.exports = router;