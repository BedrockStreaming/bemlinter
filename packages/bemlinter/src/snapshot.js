const _ = require('lodash');
const fs = require('fs');

function getLogIdentifiers(log) {
  return _.pick(log, ['moduleName', 'blockName', 'message']);
}

function getActualQuality(lintResult) {
  return {
    errorList: lintResult.getErrorList().map(getLogIdentifiers),
    warningList: lintResult.getErrorList().map(getLogIdentifiers),
  };
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

function getSnapshotResult(lintResult, snapshotQuality) {
  const completeLogList = (logList, logType) => {
    const isSnapshotExists = snapshotQuality !== false;
    const isModuleExists = log => _.some(snapshotQuality[`${logType}List`], _.pick(log, ['moduleName', 'blockName']));
    const isErrorExists = log => _.some(snapshotQuality[`${logType}List`], getLogIdentifiers(log));
    const completeLog = log => {
      log.isNew = isSnapshotExists && isModuleExists(log) && !isErrorExists(log);

      return log;
    };

    return logList.map(completeLog);
  };

  return {
    errorList: completeLogList(lintResult.getErrorList(), 'error'),
    warningList: completeLogList(lintResult.getErrorList(), 'warning'),
  };
}

module.exports = function createSnapshot(lintResult, filePath) {
  const snapshotQuality = getSnapshotQuality(filePath);
  const snapshotResult = getSnapshotResult(lintResult, snapshotQuality);

  if (!isSnapshotExists() || (
      getStatus() &&
      snapshotResult.errorList.length < snapshotQuality.errorList.length
    )) {
    updateSnapshot();
  }

  function isSnapshotExists() {
    return snapshotQuality !== false;
  }

  function getStatus() {
    return !_.some(snapshotResult.errorList, {isNew: true});
  }

  function updateSnapshot() {
    console.log('snapshot updated!');
    const actualQuality = getActualQuality(lintResult);
    fs.writeFileSync(filePath, JSON.stringify(actualQuality));
  }

  return {isSnapshotExists, updateSnapshot, getStatus, snapshotResult};
};
