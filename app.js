var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs=require('fs');

var matrix = require('./matrix');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/pic/:id', function(req, res) {
  var pic = req.param('id');
  matrix.showFile("icons/"+pic,null,false,function(err) {    
    console.log("show file");
    if (err) {
      res.send("not found\n");
    } else {
      res.send("ok\n");      
    }
  });
});

app.get('/pic/:id/:timeout', function(req,res) {
  var pic = req.param('id');
  var timeout = req.param('timeout');
  matrix.showFile("icons/"+pic,timeout,false,function(err) {    
    console.log("show file");
    if (err) {
      res.send("not found\n");
    } else {
      res.send("ok\n");      
    }
  });
});

app.get('/animonce/:id/:timeout', function(req,res) {
  var pic = req.param('id');
  var timeout = req.param('timeout');
  matrix.showFile("icons/"+pic,timeout,true,function(err) {    
    console.log("show file");
    if (err) {
      res.send("not found\n");
    } else {
      res.send("ok\n");      
    }
  });
});

app.post('/pic/:id',function(req,res) {

});

// error handlers
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
