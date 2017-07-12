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
//const fileinclude    = require('gulp-file-include');  //вставляет стили из header.min.css в index.html
//const gulpRemoveHtml = require('gulp-remove-html');
const ftp            = require('vinyl-ftp');


gulp.task('styl', function () {
    return gulp.src('app/styl/common.styl')
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
        'app/libs/jquery/dist/jquery.js'
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


gulp.task('build', gulp.parallel('styl', 'assets', 'js', 'libs'));


gulp.task('watch', function() {
    gulp.watch('app/styl/**/*', gulp.series('styl'));
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
    return del('dist', {force: true});
});


gulp.task('imagemin', function() {
    return gulp.src('app/assets/img/**/*')
        .pipe(cache(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({plugins: [{removeViewBox: true}]})
        ])))
        .pipe(gulp.dest('dist/img'));
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


/*

 gulp.task('ftp', function() {
 let conn = ftp.create({
 host:      'ftp60.hostland.ru',
 user:      'host1474862',
 password:  'f4ceaa46',
 parallel:  10,
 log: gutil.log
 });

 var globs = 'dist/!**';

 return gulp.src(globs, {since: gulp.lastRun('production')})
 .pipe(newer('/polyfill.ru/htdocs/www'))
 .pipe(conn.dest('/polyfill.ru/htdocs/www'));
 });
 */

/*

 gulp.task('production',
 gulp.series(['imagemin','ftp'])
 );
 */


//production
//gulp.task('production', gulp.series('removedist', 'assets', 'libs', 'styl', 'js', 'buildhtml', 'imagemin', 'removeHeaderCSS'));
gulp.task('production', gulp.series('removedist', 'assets', 'libs', 'styl', 'js', 'imagemin'));



gulp.task('default',
    gulp.series(['removedist', 'build',
        gulp.parallel('watch', 'browser-sync')])
);