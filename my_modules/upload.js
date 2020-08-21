/* 파일 업로드 모듈 */

const multer = require('multer')
const path = require("path")

var _storage = multer.diskStorage({
    // upload 폴더에 저장
    destination: function (req, file, cb) { 
        cb(null, 'upload/')
    },
    // 저장할 파일 이름 정하기
    filename: function (req, file, cb) {
        //let extension = path.extname(file.originalname);    //확장자 추출
        //let basename = path.basename(file.originalname, ext);
        
        // 현재 시간.jpg 형식으로 저장
        cb(null, Date.now()+"_"+file.originalname) 
    }
});

var upload = multer({
        storage: _storage
    });

module.exports = upload;