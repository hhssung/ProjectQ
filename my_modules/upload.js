const multer = require('multer')
const path = require("path")

var _storage = multer.diskStorage({
    destination: function (req, file, cb) { //어디 위치에 저장?
        cb(null, 'upload/')
    },
    filename: function (req, file, cb) { //어떤 이름으로 저장?
        let extension = path.extname(file.originalname);    //확장자 추출
        cb(null, Date.now()+ "." + extension) // 현재 시간.jpg 형식으로 저장
    }
});

var upload = multer({
        storage: _storage
    });

module.exports = upload;