'use strict';

const gulp         = require('gulp');
const watch        = require('gulp-watch');
const stylus       = require('gulp-stylus');
const nib          = require('nib');
const debug        = require('gulp-debug');
const plumber      = require('gulp-plumber');
const rename       = require('gulp-rename');
const browserSync  = require('browser-sync').create();
const sourcemaps   = require('gulp-sourcemaps');
const newer        = require('gulp-newer');
const notify       = require('gulp-notify');
const cssnano      = require('gulp-cssnano');
const concat       = require('gulp-concat');
const uglify       = require('gulp-uglify');
const imagemin     = require('gulp-imagemin'); // Подключаем библиотеку для работы с изображениями
const pngquant     = require('imagemin-pngquant'); // Подключаем библиотеку для работы с png
const cache        = require('gulp-cache'); // Подключаем библиотеку кеширования


//сжать картинки
gulp.task('img', function() {
	return gulp.src('app/img/**/*')
    .pipe(debug({title: 'IMG'}))
		.pipe(cache(imagemin({
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		})))
		.pipe(gulp.dest('dist/img'));
});


//сжать скрипт common.js
gulp.task('js', function () {
    gulp.src('app/assets/js/common.js') 
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));
});




gulp.task('styles', function () {
  return gulp.src('app/styl/main.styl') 
    .pipe(plumber({
      errorHandler: notify.onError(err => ({
        title: 'Styles',
        message: err.message
      }))
    }))
    .pipe(sourcemaps.init())
        //.pipe(debug({title: 'src'}))
    .pipe(stylus({
      use:[nib()],
      'include css': true
    }))
        //.pipe(debug({title: 'stylus'}))
    .pipe(cssnano())
    .pipe(rename({suffix: '.min', prefix : ''}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/css'));
});


gulp.task('libs', function () {
  return gulp.src([
    'app/libs/modernizr/modernizr.js',
    'app/libs/jquery/jquery.min.js',
    'app/libs/animate/animate-css.js'
  ])
    .pipe(plumber({
      errorHandler: notify.onError(err => ({
        title: 'Libs',
        message: err.message
      }))
    }))
  .pipe(concat('libs.js'))
  .pipe(uglify())
  .pipe(rename({suffix: '.min', prefix : ''}))
  .pipe(gulp.dest('dist/js'));
});


gulp.task('assets', function() {
  return gulp.src('app/assets/**/*.*', {since: gulp.lastRun('assets')})
    .pipe(newer('dist'))
    .pipe(gulp.dest('dist'));
});


gulp.task('build', gulp.parallel('styles', 'assets', 'libs')
);


gulp.task('watch', function() {
  gulp.watch('app/styl/**/*.styl', gulp.series('styles'));
  gulp.watch('app/assets/**/*.*', gulp.series('assets'));
});


gulp.task('browser-sync', function() {
  browserSync.init({
    server: 'dist',
    notify: false
  });
  browserSync.watch(['dist/**/*.*', '!js/**']).on('change', browserSync.reload);
});


gulp.task('clear', function (callback) {
	return cache.clearAll();
})


gulp.task('default', 
  gulp.series('build', 
  gulp.parallel('watch', 'browser-sync'))
);




