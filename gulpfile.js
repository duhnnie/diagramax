const gulp = require('gulp'),
    gutil = require('gulp-util'),
    concat = require('gulp-concat'),
    http = require('http'),
    fs = require('fs'),
    path = require('path');

gulp.task('example', ['default'], function () {
    let port = 3000;
    http.createServer(function (request, response) {
        var filePath = request.url;
        if (filePath == '/')
            filePath = '/index.html';

        var extname = path.extname(filePath);
        var contentType = 'text/html';
        switch (extname) {
            case '.html':
                filePath = '/example' + filePath;
                break;
            case '.js':
                contentType = 'text/javascript';
                break;
            case '.css':
                contentType = 'text/css';
                break;
            case '.json':
                contentType = 'application/json';
                break;
        }
        filePath = '.' + filePath;
        fs.readFile(filePath, function(error, content) {
            if (error) {
                if(error.code == 'ENOENT'){
                    response.writeHead(404, { 'Content-Type': contentType });
                    response.end("NOT FOUND", 'utf-8');
                } else {
                    response.writeHead(500);
                    response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
                    response.end();
                }
            } else {
                response.writeHead(200, { 'Content-Type': contentType });
                response.end(content, 'utf-8');
            }
        });

    }).listen(port);
    console.log(`Server running at http://127.0.0.1:${port}/`);
});

gulp.task('default', function (cb) {
    gulp.src([
            'src/svg_factory.js',
            'src/bpmn_factory.js',
            'src/element.js',
            'src/bpmn_element.js',
            'src/bpmn_project.js',
            'src/canvas.js',
            'src/connection.js',
            'src/port.js',
            'src/shape.js',
            'src/start_event.js',
            'src/end_event.js',
            'src/activity.js',
            'src/connection_manager.js',
            'src/drag_drop_manager.js',
            'src/event_bus.js'
        ])
        .pipe(concat('designer.js'))
        .pipe(gulp.dest('./dist/'))
        .on('end', function () {
            cb();
        });
});
