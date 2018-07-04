var gulp = require('gulp')
    connect = require('gulp-connect');

/**
 * Use gulp-connect to start a development server
 */
gulp.task('connect', function() {
    connect.server({
	    root: 'dist',
        livereload: true
    });
});

/**
 * Pipe all the HTML and reload.
 */
gulp.task('html', function () {
    gulp.src('./dist/**/*.html').pipe(connect.reload());
});

/**
 * Watch the HTML files.
 */
gulp.task('watch', function () {gulp.watch(['./dist/**/*.html','./dist/**/*.js','./dist/**/*.css'], ['html']);});

/**
 * Default tasks
 */
gulp.task('default', ['connect', 'watch']);
