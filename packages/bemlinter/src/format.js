const _ = require('lodash');
const path = require('path');
const colors = require('colors');

// Output
function getContextualMessage(message, filePath, line) {
  const contextualMessage = [];
  if (filePath) {
    contextualMessage.push(`[${path.basename(filePath)}`);
    if (line) {
      contextualMessage.push(`:${line}`);
    }
    contextualMessage.push('] ');
  }
  contextualMessage.push(message);

  return contextualMessage.join('');
}

module.exports = function (lintResult, withColor = true) {
  const format = [];
  const moduleList = lintResult.getModuleList();
  const blockCount = lintResult.getBlockList().length;
  const errorCount = lintResult.getErrorList().length;
  const hasSnapshot = lintResult.hasSnapshot();
  let hasDetails = false;

  moduleList.forEach(moduleName => {
    const blockList = lintResult.getBlockList(moduleName);

    blockList.forEach(blockName => {
      let errorList;
      let warningList;

      if (hasSnapshot) {
        errorList = lintResult.getSnapshot().getNewErrorList(moduleName, blockName);
        warningList = lintResult.getSnapshot().getNewWarningList(moduleName, blockName);
      } else {
        errorList = lintResult.getErrorList(moduleName, blockName);
        warningList = lintResult.getWarningList(moduleName, blockName);
      }

      if (errorList.length || warningList.length) {
        formatStatus(moduleName, blockName, !errorList.length);
        hasDetails = true;
      }
      if (errorList.length) {
        errorList.forEach(formatError);
      }
      if (warningList.length) {
        warningList.forEach(formatWarning);
      }
    });
  });

  if (hasDetails) {
    format.push('');
  }
  if (errorCount) {
    format.push(`${hasSnapshot ? '' : 'FAIL: '}bemlinter has detected ${errorCount} error${errorCount > 1 ? 's' : ''} on ${blockCount} block${blockCount > 1 ? 's' : ''}.`);
  } else {
    format.push(`${hasSnapshot ? '' : 'OK: '}bemlinter has validated ${blockCount} block${blockCount > 1 ? 's' : ''}.`);
  }

  if (hasSnapshot) {
    const newErrorCount = lintResult.getSnapshot().getNewErrorList().length;

    if (newErrorCount) {
      format.push(`FAIL: bemlinter has detected ${newErrorCount} new error${newErrorCount > 1 ? 's' : ''}.`);
    } else {
      format.push(`OK: bemlinter has detected no new error.`);
    }
  }

  return format.join("\n");

  function formatWarning({message, filePath, line}) {
    format.push(getContextualMessage(`Warning: ${message}`, filePath, line));
  }

  function formatError({message, filePath, line}) {
    format.push(getContextualMessage(`Error: ${message}`, filePath, line));
  }

  function formatStatus(moduleName, blockName, blockStatus) {
    let line = `  ${blockStatus ? '✓' : '✗'} ${moduleName !== '__root' ? `${moduleName} / ` : ''}${blockName}`;
    if (withColor) {
      line = colors[blockStatus ? 'green' : 'red'](line);
    }
    format.push(line);
  }
};
