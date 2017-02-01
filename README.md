bemlinter [![Build Status](https://travis-ci.org/M6Web/bemlinter.svg?branch=master)](https://travis-ci.org/M6Web/bemlinter)
======

A tool belt to lint bem components:

 * [bemlinter](https://github.com/M6Web/bemlinter/blob/master/packages/bemlinter/README.md): A cli tool to lint bem component isolation in CSS / SCSS files
 * [gulp-bemlinter](https://github.com/M6Web/bemlinter/blob/master/packages/gulp-bemlinter/README.md): A gulp plugin to lint bem component isolation in CSS / SCSS files


To developers
------

It's a monorepo managed with [lerna](https://lernajs.io/):

```sh
npm install --global lerna@^2.0.0-beta
```

To launch tests:

```sh
lerna run test
```