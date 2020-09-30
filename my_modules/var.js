/* 전역 변수들을 모아놓은 곳 */

var LINK = "http://qmoment.qmoment.tk:9000"

// 파일 경로
var variables = {
    file_names: [{
        name: 'p_excel'
    }, {
        name: 'p_logo'
    }, {
        name: 'p_background'
    }, {
        name: 'p_explain'
    }],
    server: LINK,
    server_files: LINK + "/files/",
    server_links: LINK + "/links/",
    server_pdfs: LINK + "/pdfs/",
    server_css: LINK + "/css/",
    makelink_css: `/* 모바일 기기 */
    @font-face {
        font-family: 'Nanum Myeongjo';
        src: url('http://qmoment.qmoment.tk:9000/css/NanumMyeongjo.woff') format('woff'),
            url('http://qmoment.qmoment.tk:9000/css/NanumMyeongjo.ttf') format('truetype');
        font-weight: normal;
        font-style: normal;
    }
    h1 {
        font-family: 'Nanum Myeongjo', Arial, Helvetica, sans-serif;
        font-size: 2em;
        text-align: center;
        margin-right: 0%;
        margin-left: 0%;
    }
    body {
        font-family: 'Nanum Myeongjo', Arial, Helvetica, sans-serif;
        margin-right: 0%;
        margin-left: 0%;
    }
    table {
        width: 100%;
        border: 0;
        font-size: 1.5em;
        border-collapse: collapse;
    }
    td,
    tr {
        margin-top: 0.5em;
        margin-bottom: 0.5em;
        padding: 1em;
    }
    #date {
        width: 20%;
        font-weight: 800;
        text-align: right;
        border-right: 3px solid #444444;
    }
    #contents {
        font-weight: 400;
        line-height: 150%;
    }
    #time {
        font-weight: 800;
        text-align: right;
        font-size: 0.6em;
        line-height: 250%;
    }`,
    chatArray: []
}


module.exports = variables;
