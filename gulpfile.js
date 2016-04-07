var gulp         = require('gulp'),
    stylus       = require('gulp-stylus'),
    nib          = require('nib'),
    plumber      = require('gulp-plumber'),
    cleanCSS     = require('gulp-clean-css'),
    rename       = require('gulp-rename'),
    browserSync  = require('browser-sync').create(),
    concat       = require('gulp-concat'),
    uglify       = require('gulp-uglify');

gulp.task('browser-sync', ['stylus', 'scripts'], function() {
  browserSync.init({
    server: {
      baseDir: "./app"
    },
    notify: false
  });
});

gulp.task('stylus', function () {
  return gulp.src('styl/*.styl')
  .pipe(plumber())
  .pipe(stylus({
    use:[nib()],
    'include css': true
  }))
  .pipe(rename({suffix: '.min', prefix : ''}))
  .pipe(cleanCSS())
  .pipe(gulp.dest('app/css'))
  .pipe(browserSync.stream());
});

gulp.task('scripts', function() {
  return gulp.src([
    './app/libs/modernizr/modernizr.js',
    './app/libs/jquery/jquery.min.js',
    './app/libs/animate/animate-css.js'
  ])
  .pipe(plumber())
  .pipe(concat('libs.js'))
  //.pipe(uglify()) //Minify libs.js
  .pipe(gulp.dest('./app/js/'));
});

gulp.task('watch', function () {
	gulp.watch('styl/*.styl', ['stylus']);
	gulp.watch('app/libs/**/*.js', ['scripts']);
	gulp.watch('app/js/*.js').on("change", browserSync.reload);
	gulp.watch('app/*.html').on('change', browserSync.reload);
});

gulp.task('default', ['browser-sync', 'watch']);
