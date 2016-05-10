'use strict';

const gulp         = require('gulp');
const watch        = require('gulp-watch');
const stylus       = require('gulp-stylus');
const nib          = require('nib');
const debug        = require('gulp-debug');  //для отлова ошибок
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
const babel        = require('gulp-babel');



gulp.task('styles', function () {
  return gulp.src(['app/styles/main.styl', 'app/styles/header.styl', 'app/styles/fonts.styl']) 
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
    .pipe(cssnano())  //если нужно сжать css
    .pipe(rename({suffix: '.min', prefix : ''}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/css'));
});


gulp.task('assets', function() {
  return gulp.src('app/assets/**/*.*', {since: gulp.lastRun('assets')})
    .pipe(newer('dist'))
    .pipe(gulp.dest('dist'));
});


gulp.task('js', function () {
  return gulp.src('app/js/common.js') 
    .pipe(plumber({
      errorHandler: notify.onError(err => ({
        title: 'JS',
        message: err.message
      }))
    }))
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(uglify())   //сжатие common.js
    .pipe(gulp.dest('dist/js'));
});


gulp.task('libs', function () {
  return gulp.src([
    //все js библиотеки подключать сюда
    'app/assets/libs/jquery/dist/jquery.min.js',
    'app/assets/libs/modernizr/modernizr.min.js'
    //'app/assets/libs/lightgallery/dist/js/lightgallery.min.js',
    //'app/assets/libs/magnific-popup/dist/jquery.magnific-popup.min.js',
    //'app/assets/libs/animateNumber/jquery.animateNumber.min.js',
    //'app/assets/libs/waypoints/lib/jquery.waypoints.min.js',
    //'app/assets/libs/bxslider/jquery.bxSlider.min.js',
    //'app/assets/libs/uglipop/uglipop.min.js',
    //'app/assets/libs/flipclock/compiled/flipclock.min.js'
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


gulp.task('build', gulp.parallel('styles', 'assets', 'js', 'libs'));


gulp.task('watch', function() {
  gulp.watch('app/styles/**/*', gulp.series('styles'));
  gulp.watch('app/js/**/*.js', gulp.series('js'));
  gulp.watch('app/assets/**/*.*', gulp.series('assets'));
});


gulp.task('browser-sync', function() {
  browserSync.init({
    server: 'dist',
    notify: false
  });
  browserSync.watch('dist/**/*.*').on('change', browserSync.reload);
});


gulp.task('default', 
  gulp.series('build', 
  gulp.parallel('watch', 'browser-sync'))
);

//////////////ДОПОЛНИТЕЛЬНО//////////////////////

/*сжать картинки*/
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