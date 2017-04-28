const _ = require('lodash');
const fs = require('mz/fs');
const path = require('path');
const {lint, format} = require('./../../src/bemlinter');

function lintCommand(argv) {
  return new Promise(resolve => {
    if (!argv.config) {
      return resolve({sources: argv._});
    }
    fs.readFile(argv.config, {encoding:'utf8'})
      .then(data => JSON.parse(data))
      .then(config => {
        const basePath = path.dirname(argv.config);
        config.excludePath = (config.excludePath || [])
          .map(filePath => `!${path.resolve(basePath, filePath)}`);
        config.sources = config.sources
          .map(filePath => path.resolve(basePath, filePath))
          .concat(config.excludePath);
        resolve({
          sources: config.sources,
          options: _.omit(config, 'sources', 'excludePath')
        });
      })
      .catch(console.error);
  })
    .then(params => {
      if (params.sources.length < 1) {
        console.log('Usage: bemlinter lint <scss-file> [<scss-file> ...]');
        process.exit(1);
      }

      return lint(params.sources, params.options);
    })
    .then(lintResult => {
      console.log(format(lintResult));
      if (argv.u) {
        lintResult.getSnapshot().updateSnapshot();
        console.log('');
        console.log('OK: Snapshot updated');
        process.exit(0);
      }
      process.exit(lintResult.getStatus() ? 0 : 1);
    })
    .catch(console.error);
}

module.exports = lintCommand;
