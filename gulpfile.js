var gulp = require('gulp'),
  plugins = require('gulp-load-plugins')();
  
var BUILD_PATH = './build/';
var JS_LOCATIONS = [
  './controllers/*.js',
  './lib/*.js'
];
var AUTOPREFIXER_BROWSERS = [
  'last 2 versions',
  'last 5 chrome versions',
  'safari >= 5',
  'ios >= 6',
  'android >= 2',
  'ff >= 30',
  'opera >= 22',
  'ie >= 8',
  'ie_mob >= 10'
];

gulp.task('jshint', function () {
  return gulp.src(JS_LOCATIONS)
    .pipe(plugins.jshint('.jshintrc'))
    .pipe(plugins.jshint.reporter('jshint-stylish'));
});

// format JavaScript based on pretty rules
gulp.task('pretty', function () {
  return gulp.src(JS_LOCATIONS, {base: '.'})
    .pipe(plugins.jsbeautifier({ config: '.jsbeautifyrc' }))
    .pipe(gulp.dest('.'))
});

// bump version
gulp.task('bump', function () {
  return gulp.src('./package.json')
    .pipe(plugins.bump({type: 'patch'}))
    .pipe(gulp.dest('./'));
});

// del build
gulp.task('clean', function (cb) {
  require('del').bind(null, [BUILD_PATH]);
  
  return cb();
});

// build documentation
gulp.task('docs', function () {
  return gulp.src(JS_LOCATIONS.concat(['README.md']), {base: '.'})
    .pipe(plugins.doxx({
      title: 'HashDo Web',
      urlPrefix: ''
    }))
    .pipe(gulp.dest(BUILD_PATH + 'docs'));
});

gulp.task('watch', function () {
  gulp.watch(JS_LOCATIONS, gulp.series('jshint'));
});

gulp.task('default', gulp.series('watch'));