const { lint, format } = require('../../src/bemlinter');

function lintCommand({ sources, userOptions, argv }) {
  if (sources.length < 1) {
    console.log('Usage: bemlinter lint <scss-file> [<scss-file> ...]');
    console.log('');
    process.exit(1);
  }

  return lint(sources, userOptions)
    .then((lintResult) => {
      console.log(format(lintResult));

      if (argv.u) {
        lintResult.getSnapshot().updateSnapshot();
        console.log('');
        console.log('OK: Snapshot updated');
        console.log('');
        process.exit(0);
      }
      process.exit(lintResult.getStatus() ? 0 : 1);
    })
    .catch(console.error);
}

module.exports = lintCommand;
