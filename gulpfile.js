'use strict';

const gulp           = require('gulp');
const watch          = require('gulp-watch');
const stylus         = require('gulp-stylus');
const nib            = require('nib');  //библиотека миксинов для stylus
const debug          = require('gulp-debug');  //для отлова ошибок
const plumber        = require('gulp-plumber');
const rename         = require('gulp-rename');
const browserSync    = require('browser-sync').create();
const sourcemaps     = require('gulp-sourcemaps');
const newer          = require('gulp-newer');
const notify         = require('gulp-notify');
const cssnano        = require('gulp-cssnano');
const concat         = require('gulp-concat');
const uglify         = require('gulp-uglify');
const cache          = require('gulp-cache'); // Подключаем библиотеку кеширования
const babel          = require('gulp-babel');
const gutil          = require('gulp-util' );
const del            = require('del');
const imagemin       = require('gulp-imagemin');
const pngquant       = require('imagemin-pngquant');
const fileinclude    = require('gulp-file-include');  //вставляет стили из header.min.css в index.html
const gulpRemoveHtml = require('gulp-remove-html');
const ftp            = require('vinyl-ftp');


gulp.task('styles', function () {
  return gulp.src(['app/styles/main.styl', 'app/styles/header.styl', 'app/styles/fonts.styl']) 
    .pipe(plumber({
      errorHandler: notify.onError(err => ({
        title: 'Styles',
        message: err.message
      }))
    }))
    .pipe(sourcemaps.init())
    .pipe(debug({title: 'src'}))
    .pipe(stylus({
      use:[nib()],
      'include css': true
    }))
    .pipe(debug({title: 'stylus'}))
    .pipe(cssnano())  //сжать css
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
    .pipe(uglify())   //сжать common.js
    .pipe(gulp.dest('dist/js'));
});


gulp.task('libs', function () {
  return gulp.src([
    //все js библиотеки подключать сюда
	'app/assets/libs/jquery/dist/jquery.min.js',
    'app/assets/libs/es5-shim/es5-shim.min.js',
    'app/assets/libs/es5-shim/es5-sham.min.js',
    'app/assets/libs/modernizr/modernizr.min.js'
    //'app/assets/libs/owl.carousel/owl.carousel.min.js',
    //'app/assets/libs/jQuery.equalHeights/jquery.equalheights.min.js',
    //'app/assets/libs/magnific-popup/dist/jquery.magnific-popup.min.js',
    //'app/assets/libs/animateNumber/jquery.animateNumber.min.js',
    //'app/assets/libs/waypoints/lib/jquery.waypoints.min.js',
    //'app/assets/libs/masonry/dist/masonry.pkgd.min.js'
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


gulp.task('removedist', function() { 
  return del('dist'); 
});


gulp.task('removeHeaderCSS', function() { 
  return del(['dist/css/header.min.css']); 
});


gulp.task('buildhtml', function() {
  return gulp.src(['dist/*.html'])
    .pipe(fileinclude({
      prefix: '@@'
    }))
    .pipe(gulpRemoveHtml())
    .pipe(gulp.dest('dist/'));
});


gulp.task('imagemin', function() {
	return gulp.src('dist/img/**/*')
		.pipe(cache(imagemin({
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		})))
		.pipe(gulp.dest('dist/img')); 
});


//production
gulp.task('production', gulp.series('removedist', 'assets', 'libs', 'styles', 'js', 'buildhtml', 'imagemin', 'removeHeaderCSS'));


gulp.task('default', 
  gulp.series('build', 
  gulp.parallel('watch', 'browser-sync'))
);