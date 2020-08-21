/* 기본 페이지 */

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: '서버 테스트용 임시 페이지'
  });
});

module.exports = router;