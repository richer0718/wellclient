var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var version = '2.9.5';

gulp.task('default', function(){
	gulp.src('public/js/well-*.js')
	.pipe(uglify())	.pipe(rename({suffix: '.'+version+'.min'}))
	.pipe(gulp.dest('public/dist/js'));
});