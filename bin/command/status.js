const createOptions = require('../../src/options.js');
const {createSnapshot} = require('../../src/snapshot');

function statusCommand({userOptions}) {
  const options = createOptions(userOptions);
  const snapshotFilePath = options.getOptions('snapshot');
  if (snapshotFilePath === false) {
    console.log('Usage: bemlinter status --config bemlinter.json');
    console.log('');
    process.exit(1);
  }

  const snapshot = createSnapshot(snapshotFilePath);
  const errorCount = snapshot.getErrorList().length;
  console.log(`bemlinter currently know ${errorCount} errors`);
  console.log('');
}

module.exports = statusCommand;
