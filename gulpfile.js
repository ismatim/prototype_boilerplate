const gulp = require('gulp');
const browserSync = require('browser-sync');
const reload = browserSync.reload;
const rimraf= require('rimraf');
const postcss = require('gulp-postcss');
const harp = require('harp');
const sass = require('gulp-sass');
const stylelint = require('gulp-stylelint');
const cssDeclarationSorter = require('css-declaration-sorter');
const autoprefixer = require('gulp-autoprefixer');

var SOURCES_PATH = './src/';
var PUBLIC_PATH = `${SOURCES_PATH}/www`;

gulp.task('clean', function(done) {
  return rimraf(`${PUBLIC_PATH}`, () => {
    console.log('Folder deleted.');
    done();
  });
});

gulp.task('lint', function() {
  return gulp.src(`${PUBLIC_PATH}/**/*.scss`).pipe(
    stylelint({
      reporters: [
        {
          formatter: 'string',
          console: true
        }
      ]
    })
  );
});

gulp.task('postcss', function() {
  return gulp
    .src(['./src/*.sass'])
    .pipe(
      sass({
        outputStyle: 'expanded'
      }).on('error', sass.logError)
    )
    .pipe(
      autoprefixer({
        browsers: ['> 5%', 'last 4 versions'],
        cascade: false
      })
    )
    .pipe(postcss([cssDeclarationSorter()]))
    .pipe(gulp.dest(`src/dist/www/`)); // This is an opt-in to put all files as an intermediate states.
});

gulp.task('harp:compile', done => {
  return harp.compile(`./src`, '../dist', () => {
    done();
  });
});


gulp.task('start', function(done) {
  harp.server(
    __dirname + '/src/',
    {
      port: 9000
    },
    function() {
      //Start the BrowserSync server
      browserSync.init({
        proxy: 'localhost:9000',
        open: false
      });

      //Inject the sass/css changes through stream in task sass.
      gulp
        .watch([
          `./src/*.sass`
        ])
        .on('change', reload);

      //Watch other files and reload.
      gulp
        .watch([
          '*.html',
          './src/pages/*.jade',
          './src/*.jade',
          './src/partial/*.jade',
          './src/js/**/*.js',
          '*.json',
          '*.md'
        ])
        .on('change', reload);
      done();
    }
  );
});
