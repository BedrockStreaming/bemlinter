const path = require('path');

module.exports = function () {
  const logs = [];
  const basePath = process.cwd();
  
  // Logs
  function addLog(type, message, filePath, blockName, wrapper) {
    logs.push({
      type,
      message,
      filePath: `./${path.relative(basePath, filePath)}`,
      blockName,
      line: wrapper ? wrapper.node.start.line : null
    });
  }

  function addInfo(message, filePath, blockName, wrapper) {
    addLog('info', message, filePath, blockName, wrapper);
  }

  function addError(message, filePath, blockName, wrapper) {
    addLog('error', message, filePath, blockName, wrapper);
  }

  function addWarning(message, filePath, blockName, wrapper) {
    addLog('warning', message, filePath, blockName, wrapper);
  }
  
  function getLogs() {
    return logs;
  }
  
  return {addInfo, addError, addWarning, getLogs};
};