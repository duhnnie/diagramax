const gulp = require('gulp'),
    gutil = require('gulp-util'),
    concat = require('gulp-concat');

gulp.task('default', function (cb) {
    gulp.src([
            "js/jquery-3.2.1.min.js",
            "js/lodash.js",
            "js/utils.js",
            "js/tiny-stack.js",
            "js/sax.js",
            "js/refs.js",
            "js/BpmnTreeWalker.js",
            "js/bpmn-moddle.js",
            "js/designer.js"
        ])
        .pipe(concat('designer.js'))
        .pipe(gulp.dest('./dist/'))
        .on('end', function () {
            cb();
        });
});