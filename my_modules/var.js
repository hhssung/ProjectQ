// 여러 변수들을 모아놓은 곳

var LINK = "http://localhost:9000"

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
    server_pdfs: LINK + "/pdfs/"
}


module.exports = variables;
