var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const base = './routes/';

var indexRouter = require(base+'index');
var userRouter = require(base+'user');

var adminRouter = require(base+'admin');
var admin_addProductRouter = require(base+'admin_addproduct');
var admin_deleteProductRouter = require(base+'admin_deleteproduct');
var productRouter = require(base+'product');
var diaryRouter = require(base+'diary');
var subscribeRouter = require(base+'subscribe');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/admin', adminRouter);
app.use('/admin/add_product', admin_addProductRouter);
app.use('/admin/delete_product',admin_deleteProductRouter);
app.use('/product',productRouter);
app.use('/diary',diaryRouter);
app.use('/subscribe',subscribeRouter);

app.use('/files', express.static('upload'));  // http://localhost:3961/files/~~~.png 이런 식으로 불러오기 가능

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
