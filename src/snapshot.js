const _ = require('lodash');
const fs = require('fs');
const createLog = require('./log');

function getSnapshotLog(log) {
  return _.pick(log, ['moduleName', 'blockName', 'message']);
}

function getSnapshotLogList(list) {
  return _.sortBy(list.map(getSnapshotLog), ['moduleName', 'blockName', 'message']);
}

function getSnapshotLogsFromResult(lintResult) {
  return {
    errorList: getSnapshotLogList(lintResult.getErrorList()),
    warningList: getSnapshotLogList(lintResult.getWarningList()),
  };
}

function getSnapshotLogsFromFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  const data = fs.readFileSync(filePath).toString();
  try {
    return JSON.parse(data);
  } catch (error) {
    return false;
  }
}

function addLogAntecedence(lintResult, antecedenceLogs) {
  const isSnapshotExists = antecedenceLogs !== false;
  const completeLogList = (logList, logType) => {
    const hasAntecedence = log => _.some(antecedenceLogs[`${logType}List`], getSnapshotLog(log));
    const completeLog = (log) => {
      const logWithAntecedence = log;
      logWithAntecedence.isNew = isSnapshotExists && !hasAntecedence(log);

      return logWithAntecedence;
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

  function getFilterCriteria(moduleName, blockName) {
    const criteria = { isNew: true };
    if (moduleName) {
      criteria.moduleName = moduleName;
      if (blockName) {
        criteria.blockName = blockName;
      }
    }

    return criteria;
  }

  function getNewErrorList(moduleName = false, blockName = false) {
    return _.filter(
      lintResultWithAntecedence.errorList,
      getFilterCriteria(moduleName, blockName),
    );
  }

  function getNewWarningList(moduleName = false, blockName = false) {
    return _.filter(
      lintResultWithAntecedence.warningList,
      getFilterCriteria(moduleName, blockName),
    );
  }

  function getStatus(moduleName = false, blockName = false) {
    return !_.some(
      lintResultWithAntecedence.errorList,
      getFilterCriteria(moduleName, blockName),
    );
  }

  function isSnapshotExists() {
    return snapshotLogs !== false;
  }

  function shouldUpdateSnapshot() {
    if (!isSnapshotExists()) {
      return true;
    }

    return (
      getStatus() &&
      lintResultWithAntecedence.errorList.length < snapshotLogs.errorList.length
    );
  }

  function updateSnapshot() {
    const newSnapshotLogs = getSnapshotLogsFromResult(lintResult);
    fs.writeFileSync(filePath, JSON.stringify(newSnapshotLogs, null, 2));
  }

  if (shouldUpdateSnapshot()) {
    updateSnapshot();
  }

  return {
    isSnapshotExists,
    getNewErrorList,
    getNewWarningList,
    getStatus,
    updateSnapshot,
    result: lintResultWithAntecedence,
  };
}

module.exports = { createSnapshot, createLintResult };
