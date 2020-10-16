import { dest, parallel, series, src, watch } from 'gulp';

import babel from 'gulp-babel';
import clean from 'gulp-clean';
import concat from 'gulp-concat';
import cssmin from 'gulp-cssmin';
import header from 'gulp-header';
import less from 'gulp-less';
import replace from 'gulp-replace';
import rasterImages from './vendor/svg_raster';

const paths = {
  internalScripts: ['src/**/*.js'],
  html: 'src/public_html/**/*.html',
  less: 'src/assets/less/**/*.less',
  fonts: ['node_modules/materialize-css/dist/fonts/**/*',
          '!node_modules/materialize-css/dist/font/material-design-icons/*',
          'node_modules/material-design-icons-iconfont/dist/fonts/**/*'],
  images: ['src/assets/img/**/*', 'src/assets/icons/*'],
  locales: ['src/_locales/*.json'],
};

const packageJSON = require('./package.json');

function handleError(err) {
  // Print the plugin that the error came from so that you don't
  // have to go searching through the error message to find it.
  if (err.plugin) {
    console.error(`Error in '${err.plugin}':`); // eslint-disable-line
  }

  console.error(err); // eslint-disable-line

  // We *must* emit 'end', otherwise, when watching, the task
  // will never repeat. Note that this function is not an
  // arrow function so that the correct `this` is used here.
  this.emit('end');
}

const cleanGlob = (glob, allowSkip) => {
  if (allowSkip && process.env.GPMDP_SKIP_PACKAGE) return;
  const cleanGlobTask = () => {
    return src(glob, { read: false, allowEmpty: true })
      .pipe(clean({ force: true }));
  };
  return cleanGlobTask;
};


exports.clean = cleanGlob(['./build', './dist']);
const cleanHtmlTask = cleanGlob('./build/public_html');
const cleanInternalTask = cleanGlob(['./build/*.js', './build/**/*.js', '!./build/assets/**/*']);
const cleanFontsTask = cleanGlob('./build/assets/fonts');
const cleanLessTask = cleanGlob('./build/assets/css');
const cleanImagesTask = cleanGlob('./build/assets/img');
const cleanLocalesTask = cleanGlob('./build/_locales/*.json');

const buildHtmlTask = () =>
  src(paths.html)
  .pipe(dest('./build/public_html'));
const htmlTask = series(cleanHtmlTask, buildHtmlTask);

const transpileTask = series(cleanInternalTask, () => {
  return src(paths.internalScripts)
    .pipe(babel())
    .on('error', handleError)
    .pipe(replace(/process\.env\.([a-zA-Z_]+)?( |,|;|\))/gi, (envCall, envKey, closer) => {
      return `'${process.env[envKey]}'${closer}`;
    }))
    .pipe(dest('./build/'));
});

const localesTask = series(cleanLocalesTask, () => {
  return src(paths.locales)
  .pipe(dest('./build/_locales'));
});

const fontsTask = series(cleanFontsTask, () => {
  return src(paths.fonts)
  .pipe(dest('./build/assets/fonts'));
});

const lessTask = series(cleanLessTask, () => {
  return src(paths.less)
  .pipe(less())
  .on('error', handleError)
  .pipe(cssmin())
  .pipe(concat('core.css'))
  .pipe(dest('./build/assets/css'));
});

// Copy all static images
const copyStaticImagesTask = series(cleanImagesTask, () => {
  return src(paths.images)
  .pipe(dest('./build/assets/img/'));
});

const imagesTask = series(copyStaticImagesTask, (done) => {
  rasterImages(done);
});

const buildTask = series(transpileTask, imagesTask, lessTask, fontsTask, htmlTask, localesTask);

const buildReleaseTask = series(buildTask, () => {
  return src('./build/**/*.js')
  .pipe(header(
`/*!
${packageJSON.productName}
Version: v${packageJSON.version}
API Version: v${packageJSON.apiVersion}
Compiled: ${new Date().toUTCString()}
Copyright (C) ${(new Date()).getFullYear()} ${packageJSON.author.name}
This software may be modified and distributed under the terms of the MIT license.
*/\n`
  ))
  .pipe(dest('./build'));
});

const watchScriptsTask = () => watch(paths.internalScripts, transpileTask);
const watchHtmlTask = () => watch(paths.html, htmlTask);
const watchImagesTask = () => watch(paths.images, imagesTask);
const watchLessTask = () => watch(paths.less, lessTask);
const watchLocalesTask = () => watch(paths.locales, localesTask);

const watchTask = series(buildTask, parallel(watchScriptsTask, watchHtmlTask, watchImagesTask, watchLessTask, watchLocalesTask));

exports.default = series(watchTask, transpileTask, imagesTask);
exports.watch = watchTask;
exports.build = buildTask;
exports.buildRelease = buildReleaseTask;
