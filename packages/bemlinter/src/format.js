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
  const blockList = lintResult.getBlockList();
  const blockListWithError = lintResult.getBlockListWithError();
  let hasDetails = false;

  blockList.forEach(blockName => {
    const errorList = lintResult.getErrorList(blockName);
    const warningList = lintResult.getWarningList(blockName);

    if (errorList.length || warningList.length) {
      formatStatus(blockName, !errorList.length);
      hasDetails = true;
    }
    if (errorList.length) {
      errorList.forEach(formatError);
    }
    if (warningList.length) {
      warningList.forEach(formatWarning);
    }
  });

  if (hasDetails) {
    format.push('');
  }
  if (blockListWithError.length) {
    const errorLength = lintResult.getErrorList().length;
    format.push(`FAIL: bemlinter has detected ${errorLength} error${errorLength > 1 ? 's' : ''} on ${blockListWithError.length} block${blockListWithError.length > 1 ? 's' : ''}.`);
  } else {
    format.push(`OK: bemlinter has validated ${blockList.length} block${blockList.length > 1 ? 's' : ''}.`);
  }
  
  return format.join("\n");

  function formatWarning({message, filePath, line}) {
    format.push(getContextualMessage(`Warning: ${message}`, filePath, line));
  }

  function formatError({message, filePath, line}) {
    format.push(getContextualMessage(`Error: ${message}`, filePath, line));
  }

  function formatStatus(blockName, blockStatus) {
    let line = `  ${blockStatus ? '✓' : '✗'} ${blockName}`;
    if (withColor) {
      line = colors[blockStatus ? 'green' : 'red'](line);
    }
    format.push(line);
  }
};