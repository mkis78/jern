var hjs  = require('hogan.js');
var swig = require('swig');
var jade = require('jade');
var fs   = require('fs');
//=============================================================
function ViewHelper = function (app) {
    this.app = app;
};

ViewHelper.prototype.hoganCompile = function (template, jsondata, callback) {
    if(typeof jsondata !='object') {
        jsondata = JSON.parse(jsondata);
    }
    var t = path.join(this.app.get('views'), template + ".hjs");
    fs.readFile(t, 'utf8', function (err, data) {
        if (err) throw err;
        var fn = hjs.compile(data);
        var s = {};
        s = this.app.locals;
        s.data = jsondata;
        var k = JSON.parse(JSON.stringify(s));
        var html = fn.render(k);
        callback(html);
    });
};

ViewHelper.prototype.jadeCompile = function (template, jsondata, callback) {
    var t = path.join(this.app.get('views'), template + ".jade");
    fs.readFile(t, 'utf8', function (err, data) {
        if (err) throw err;
        var fn = jade.compile(data);
        var s = {};
        s = this.app.locals;
        s.data = jsondata;
        var k = JSON.parse(JSON.stringify(s));
        var html = fn(k);
        callback(html);
    });
};

ViewHelper.prototype.swigCompile = function(template, jsondata, callback) {
    if(typeof jsondata !='object') {
        jsondata = JSON.parse(jsondata);
    }
    var s = {};
    s = this.app.locals;
    s.data = jsondata;
    var k = JSON.parse(JSON.stringify(s));
    var t = path.join(this.app.get('views'), template + ".swig");
    swig.renderFile(t, k, function (err, output) {
    if (err) throw err;
        callback(output);
    });
};

module.exports = ViewHelper;