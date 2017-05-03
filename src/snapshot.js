const _ = require('lodash');
const fs = require('fs');
const createLog = require('./log');

function getSnapshotLog(log) {
  return _.pick(log, ['moduleName', 'blockName', 'message']);
}

function getSnapshotLogsFromResult(lintResult) {
  return {
    errorList: lintResult.getErrorList().map(getSnapshotLog),
    warningList: lintResult.getWarningList().map(getSnapshotLog),
  };
}

function getSnapshotLogsFromFile(filePath) {
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

function addLogAntecedence(lintResult, antecedenceLogs) {
  const isSnapshotExists = antecedenceLogs !== false;
  const completeLogList = (logList, logType) => {
    const hasAntecedence = log => _.some(antecedenceLogs[`${logType}List`], getSnapshotLog(log));
    const completeLog = log => {
      log.isNew = isSnapshotExists && !hasAntecedence(log);

      return log;
    };

    return logList.map(completeLog);
  };

  return {
    errorList: completeLogList(lintResult.getErrorList(), 'error'),
    warningList: completeLogList(lintResult.getWarningList(), 'warning'),
  };
}

function createSnapshot(filePath) {
  const snapshotLogs = getSnapshotLogsFromFile(filePath);

  return createLog(snapshotLogs);
}

function createLintResult(lintResult, filePath) {
  const snapshotLogs = getSnapshotLogsFromFile(filePath);
  const lintResultWithAntecedence = addLogAntecedence(lintResult, snapshotLogs);

  if (shouldUpdateSnapshot()) {
    updateSnapshot();
  }

  function isSnapshotExists() {
    return snapshotLogs !== false;
  }

  function shouldUpdateSnapshot() {
    if (!isSnapshotExists()) {
      return true;
    }

    return (getStatus() && lintResultWithAntecedence.errorList.length < snapshotLogs.errorList.length);
  }

  function updateSnapshot() {
    const newSnapshotLogs = getSnapshotLogsFromResult(lintResult);
    fs.writeFileSync(filePath, JSON.stringify(newSnapshotLogs, null, 2));
  }

  function getFilterCriteria(moduleName, blockName) {
    const criteria = {isNew: true};
    if (moduleName) {
      criteria.moduleName = moduleName;
      if (blockName) {
        criteria.blockName = blockName;
      }
    }

    return criteria;
  }

  function getStatus(moduleName = false, blockName = false) {
    return !_.some(lintResultWithAntecedence.errorList, getFilterCriteria(moduleName, blockName));
  }

  function getNewErrorList(moduleName = false, blockName = false) {
    return _.filter(lintResultWithAntecedence.errorList, getFilterCriteria(moduleName, blockName));
  }

  function getNewWarningList(moduleName = false, blockName = false) {
    return _.filter(lintResultWithAntecedence.warningList, getFilterCriteria(moduleName, blockName));
  }

  return {
    isSnapshotExists, getNewErrorList, getNewWarningList, getStatus, updateSnapshot,
    result: lintResultWithAntecedence
  };
};

module.exports = {createSnapshot, createLintResult};
