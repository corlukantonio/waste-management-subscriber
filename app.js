// @ts-check

//#region Imports

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var express = require('express');
var favicon = require('serve-favicon');
var logger = require('morgan');
var path = require('path');

//#endregion

var app = express();

/**
 * View engine setup.
 */

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', require('./routes/index'));

/**
 * Catch 404 and forward to error handler.
 */

app.use(function (req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/**
 * Error handler.
 */

app.use(function (err, req, res, next) {
  /**
   * Set locals, only providing error in development.
   */

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.error(err);

  /**
   * Render the error page.
   */

  res.status(err.status || 500);
  res.render('error');
});

process.on('SIGINT', async () => {
  console.log('Goodbye!');

  process.exit(1);
});

module.exports = app;
