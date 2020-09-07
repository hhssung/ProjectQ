/* 전역 변수들을 모아놓은 곳 */

var LINK = "http://376973220cd0.ngrok.io"

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
    server_files: LINK + "/files/",
    server_links: LINK + "/links/",
    server_pdfs: LINK + "/pdfs/",
    server_css: LINK + "/css/",
    chatArray: []
}


module.exports = variables;
