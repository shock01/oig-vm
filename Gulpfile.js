//https://gist.github.com/danharper/3ca2273125f500429945
var gulp = require('gulp');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var iife = require("gulp-iife");
var connect = require('gulp-connect');

var build = (src, out) => {
    return gulp.src(src)
        .pipe(sourcemaps.init())
        .pipe(concat(out))
        .pipe(iife({
            params: ['self'],
            args: ['self']
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('build'));
}

gulp.task('connect', function () {
    connect.server({
        livereload: true,
        middleware: function (connect) {
            return [
                connect().use('/src', connect.static('build')),
                connect().use('/lib', connect.static('lib'))
            ];
        }
    });
});

gulp.task('build-script', function () {
    return build(['src/script/**/*.js'], 'vm.js')
});

gulp.task('build-worker', function () {
    return build([
        'src/worker/dirty_observer.js',
        'src/worker/context.js',
        'src/worker/loader.js',
        'src/worker/index.js'
    ],
        'vm-worker.js')
});

gulp.task('build', ['build-script', 'build-worker']);

gulp.task('watch', function () {
    gulp.watch(['./src/scripts/**/*.*'], ['build-scripts'], function () {
        connect.reload();
    });
    gulp.watch(['./src/worker/**/*.*'], ['build-worker'], function () {
        connect.reload();
    });
});

gulp.task('serve', ['build', 'connect', 'watch']);