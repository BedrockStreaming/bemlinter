bemlinter [![Build Status](https://travis-ci.org/M6Web/bemlinter.svg?branch=master)](https://travis-ci.org/M6Web/bemlinter)
======

A gulp plugin to lint bem component isolation in SCSS files.

This project is a wrapper of [bemlinter](https://github.com/M6Web/bemlinter/blob/master/packages/bemlinter/README.md) project. 
 
Quick start
------

```sh
npm i gulp-bemlinter --save
```

You can set your `gulpfile.js` to use gulp-bemlinter:

```js
const gulp = require('gulp');
const bemlinter = require('gulp-bemlinter');

gulp.task('lint', () => {
  return gulp.src('styles/**/*.scss')
    .pipe(bemlinter())
    .pipe(bemlinter.format())
    .pipe(bemlinter.failOnError());
});
```


How to Contribute
--------

1. [Star](https://github.com/M6Web/bemlinter/stargazers) the project!
2. [Report a bug](https://github.com/M6Web/bemlinter/issues/new) that you have found.
3. Tweet or blog about bemlinter and [let us know](https://twitter.com/TechM6Web) about it.
4. Pull requests are also highly appreciated.


Author & Community
--------

bemlinter is under [MIT License](http://tzi.mit-license.org/).<br>
It was created & is maintained by [Thomas ZILLIOX](http://tzi.fr) for M6Web.


