var gulp       = require('gulp'),
    nodemon    = require('gulp-nodemon'),
    fs         = require('fs'),
    path       = require('path');
var out_log    = path.join(__dirname, "tmp", "logs");
//===================================================================
var today = new Date();
var dd    = today.getDate();
var mm    = today.getMonth()+1;
var yyyy  = today.getFullYear();

if(dd < 10) {
    dd = '0' + dd;
} 

if(mm < 10) {
    mm = '0' + mm;
} 

today = yyyy + '_' + mm + '_' + dd;
//===================================================================
gulp.task('dev', function () {
    nodemon({ 
        script: 'server.js', 
        verbose : true,
        ignore  : ['node_modules/*', 'tmp/*'], 
        env     : {
                    'NODE_ENV': 'dev'
                  }
    }).on('restart', function () {
        console.log('restarted!');
    });
});

gulp.task('prod', function () {
    nodemon({ 
        script: 'server.js', 
        verbose : true,
        ignore  : ['node_modules/*', 'tmp/*'], 
        env     : {
                    'NODE_ENV': 'prod'
                  },
        stdout  : false
    }).on('readable', function() {
        var out = path.join(out_log, "out.log");
        var err = path.join(out_log, "err.log");

        this.stdout.pipe(fs.createWriteStream(out));
        this.stderr.pipe(fs.createWriteStream(err));
    }).on('restart', function () {
        console.log('restarted!');
    });
});