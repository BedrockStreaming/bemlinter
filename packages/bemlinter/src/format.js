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
  const projectList = lintResult.getProjectList();
  const blockCount = lintResult.getBlockList().length;
  const errorCount = lintResult.getErrorList().length;
  let hasDetails = false;
  
  projectList.forEach(projectName => {
    const blockList = lintResult.getBlockList(projectName);

    blockList.forEach(blockName => {
      const errorList = lintResult.getErrorList(projectName, blockName);
      const warningList = lintResult.getWarningList(projectName, blockName);

      if (errorList.length || warningList.length) {
        formatStatus(projectName, blockName, !errorList.length);
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
    format.push(`FAIL: bemlinter has detected ${errorCount} error${errorCount > 1 ? 's' : ''} on ${blockCount} block${blockCount > 1 ? 's' : ''}.`);
  } else {
    format.push(`OK: bemlinter has validated ${blockCount} block${blockCount > 1 ? 's' : ''}.`);
  }
  
  return format.join("\n");

  function formatWarning({message, filePath, line}) {
    format.push(getContextualMessage(`Warning: ${message}`, filePath, line));
  }

  function formatError({message, filePath, line}) {
    format.push(getContextualMessage(`Error: ${message}`, filePath, line));
  }

  function formatStatus(projectName, blockName, blockStatus) {
    let line = `  ${blockStatus ? '✓' : '✗'} ${projectName !== '__root' ? `${projectName} / ` : ''}${blockName}`;
    if (withColor) {
      line = colors[blockStatus ? 'green' : 'red'](line);
    }
    format.push(line);
  }
};