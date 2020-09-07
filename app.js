var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const schedules = require('./my_modules/makeRandomTime');

const base = './routes/';

var indexRouter = require(base + 'index');
var userRouter = require(base + 'user');
var pushalarmRouter = require(base + 'pushalarm');

var adminRouter = require(base + 'admin');
var admin_addProductRouter = require(base + 'admin_addproduct');
var admin_deleteProductRouter = require(base + 'admin_deleteproduct');
var productRouter = require(base + 'product');
var diaryRouter = require(base + 'diary');
var subscribeRouter = require(base + 'subscribe');
var makelinkRouter = require(base + 'makelink');
var chatingRouter = require(base + 'chating');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
// set Port
app.set('port', process.env.PORT || 9000);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/pushalarm', pushalarmRouter);

app.use('/admin', adminRouter);
app.use('/admin/addProduct', admin_addProductRouter);
app.use('/admin/deleteProduct', admin_deleteProductRouter);
app.use('/product', productRouter);
app.use('/diary', diaryRouter);
app.use('/subscribe', subscribeRouter);
app.use('/makelink', makelinkRouter);
app.use('/chating', chatingRouter);

app.use('/files', express.static('upload')); // http://localhost:3961/files/~~~.png 이런 식으로 불러오기 가능
app.use('/links', express.static('links')); // http://localhost:3961/links/~~~.html 이런 식으로 불러오기 가능
app.use('/pdfs', express.static('pdfs')); // http://localhost:3961/pdfs/~~~.pdf 이런 식으로 불러오기 가능
app.use('/css', express.static('css')); // http://localhost:3961/css/~~~.css 이런 식으로 불러오기 가능

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

var server = app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + server.address().port);
});