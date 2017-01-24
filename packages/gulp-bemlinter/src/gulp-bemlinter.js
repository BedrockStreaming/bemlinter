const _ = require('lodash');
const path = require('path');
const {lint, format} = require('bemlinter');
const through = require('through2');
const {PluginError} = require('gulp-util');
const PLUGIN_NAME = 'bemlinter';

// Settings
const bemlinter = function (options = {}) {
  const files = [];

  return through.obj(function (file, encoding, done) {
    if (file.isNull()) {
      return done();
    }

    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
    }
    
    files.push(file.path);
    done();
  }, function (done) {
    lint(files, options)
      .then(lintLogs => {
        this.push(lintLogs);
        done();
      })
      .catch(e => {
        this.emit('error', new PluginError(PLUGIN_NAME, e.message));
      })
    ;
  });
};

bemlinter.format = function (withColor = true, media = console.log) {
  return through.obj(function (lintLogs, encoding, done) {
    media(format(lintLogs, withColor));

    this.push(lintLogs);
    done();
  });
};

bemlinter.failOnError = function () {
  return through.obj(function (lintLogs, encoding, done) {
    if (!lintLogs.getStatus()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'bemlinter found lint errors'));
    }

    done();
  });
};

module.exports = bemlinter;
