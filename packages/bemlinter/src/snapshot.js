const _ = require('lodash');
const fs = require('fs');

function getActualQuality(lintResult) {
  const quality = {};

  lintResult.getModuleList().forEach(moduleName => {
    lintResult.getBlockList(moduleName).forEach(blockName => {
      const error = lintResult.getErrorList(moduleName, blockName).length;
      const warning = lintResult.getWarningList(moduleName, blockName).length;

      quality[`${moduleName} / ${blockName}`] = {error, warning};
    });
  });

  return quality;
}

function getSnapshotQuality(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  const data = fs.readFileSync(filePath).toString();
  try {
    return JSON.parse(data);
  } catch(error) {
    return false;
  }
}

function getDifferenceQuality(actualQuality, snapshotQuality) {
  return _.transform(
    _.merge({}, snapshotQuality, actualQuality),
    (result, {error, warning}, moduleName) => {
      const isNew = typeof snapshotQuality[moduleName] === 'undefined';
      const isDeleted = typeof actualQuality[moduleName] === 'undefined';
      const reference = isNew ? actualQuality : snapshotQuality;

      result[moduleName] = {
        isNew,
        isDeleted,
        error: error - reference[moduleName].error,
        warning: warning - reference[moduleName].warning
      };
    },
    {}
  );
}

module.exports = function createSnapshot(lintResult, filePath = './.bemlinter.snap') {
  const actualQuality = getActualQuality(lintResult);
  const snapshotQuality = getSnapshotQuality(filePath);
  const differenceQuality = getDifferenceQuality(actualQuality, snapshotQuality);

  if (!isSnapshotExists() || getStatus()) {
    updateSnapshot();
  }

  function getStatus() {
    return !_.findKey(differenceQuality, ({error}) => error > 0);
  }

  function isSnapshotExists() {
    return snapshotQuality !== false;
  }

  function updateSnapshot() {
    fs.writeFileSync(filePath, JSON.stringify(actualQuality));
  }

  function getDetails() {
    return differenceQuality;
  }

  return {isSnapshotExists, updateSnapshot, getStatus, getDetails};
};
