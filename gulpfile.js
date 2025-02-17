var $             = require('gulp-load-plugins')();
var gulp          = require('gulp');
var autoprefixer  = require('autoprefixer');
var rimraf        = require('rimraf').sync;
var sequence      = require('run-sequence');
var supercollider = require('supercollider');

supercollider
  .config({
    template: './docs/src/_template.hbs',
    extension: 'md',
    marked: false,
    handlebars: require('./lib/handlebars')
  })
  .adapter('sass');

gulp.task('clean', function(done) {
  rimraf('./_build');
  rimraf('./docs/*.md');
  done();
});

gulp.task('docs', function() {
  return gulp.src('./docs/src/*.md')
    .pipe(supercollider.init())
    .pipe(gulp.dest('./docs'));
});

gulp.task('sass', function() {
  return gulp.src('./motion-ui.scss')
    .pipe($.sass().on('error', $.sass.logError))
    .pipe($.postcss([autoprefixer()]))
    .pipe(gulp.dest('./_build'));
});

gulp.task('javascript', function() {
  return gulp.src('./motion-ui.js')
    .pipe($.umd({
      dependencies: function(file) {
        return [{ name: 'jquery', amd: 'jquery', cjs: 'jquery', global: 'jQuery', param: '$' }];
      },
      exports: function(file) {
        return 'MotionUI';
      },
      namespace: function(file) {
        return 'MotionUI';
      }
    }))
    .pipe(gulp.dest('./_build'));
});

gulp.task('dist:sass', gulp.series('sass', function() {
  return gulp.src('./_build/motion-ui.css')
    .pipe(gulp.dest('./dist'))
    .pipe($.minifyCss())
    .pipe($.rename('motion-ui.min.css'))
    .pipe(gulp.dest('./dist'));
}));

gulp.task('dist:javascript', gulp.series('javascript', function() {
  return gulp.src('./_build/motion-ui.js')
    .pipe(gulp.dest('./dist'))
    .pipe($.uglify())
    .pipe($.rename('motion-ui.min.js'))
    .pipe(gulp.dest('./dist'));
}));

gulp.task('dist', gulp.series('dist:sass', 'dist:javascript'));

gulp.task('build', function(done) {
  sequence('clean', ['docs', 'sass', 'javascript'], done);
});

gulp.task('lint', function() {
  return gulp.src('./src/**/*.scss')
    .pipe($.scssLint());
})

gulp.task('default', gulp.series('build', function() {
  gulp.watch(['./docs/src/*.md', './docs/src/_template.hbs'], ['docs']);
  gulp.watch(['./src/**/*.scss', './motion-ui.scss'], ['sass']);
  gulp.watch('./motion-ui.js', ['javascript']);
}));
