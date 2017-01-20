const _ = require('lodash');
const fs = require('mz/fs');
const path = require('path');
const colors = require('colors');
const globby = require('globby');
const {parse} = require('scss-parser');
const paramCase = require('param-case');
const createQueryAst = require('query-ast');

// Utils
function groupByAndOmit(haystack, needle) {
  return _.mapValues(_.groupBy(haystack, needle), values => values.map(value => _.omit(value, needle)));
}

function eachWrapper(wrapper, fn) {
  for (let n of wrapper.nodes) { fn(n) }
}

// Settings
const defaultOptions = {
  excludeComponent: [],
  checkLowerCase: true,
  prefix: ['']
};

// Exports
module.exports = (sources, userOptions = defaultOptions) => {
  const logs = [];
  const options = _.merge({}, defaultOptions, userOptions);
  const blockList = globby.sync(sources, {
    ignore: options.excludeComponent
  }).map(getBlockNameFromFile);
  const filePathList = globby.sync(sources);

  return Promise.all(filePathList.map(filePath => bemLintFile(filePath, blockList)))
    .then(() => {
      return _.mapValues(
        groupByAndOmit(_.flatten(logs), 'blockName'),
        blockLog => groupByAndOmit(blockLog, 'type')
      );
    })
  ;
  
  // Logs
  function addLog(type, message, filePath, blockName, wrapper) {
    logs.push({
      type,
      message,
      filePath: `.${filePath.slice(path.resolve('.').length)}`,
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
  
  // CSS Class manipulation
  function getBlockNameFromFile(filePath) {
    const fileName = path.basename(filePath);
    return paramCase(fileName.slice(0, fileName.length - 4));
  }
  
  function getBlockNameFromClass(className) {
    const blockName = className.split('__')[0].split('--')[0];
    const prefixes = _.reverse(_.sortBy(options.prefix));
    const prefix = _.find(prefixes, prefix => _.startsWith(className, prefix));
    if (!prefix) {
      return blockName;
    }
    return blockName.slice(prefix.length);
  }
  
  function isBlockWithAPseudoClass($wrapper) {
    return $wrapper.parent().next().get(0).type === 'pseudo_class';
  }
  
  function isBlockName(className, blockName, prefixes = options.prefix) {
    return _.some(prefixes, prefix => {
      const prefixedBlockName = `${prefix}${blockName}`;
      return (
        className === prefixedBlockName ||
        _.startsWith(className, `${prefixedBlockName}--`) ||
        _.startsWith(className, `${prefixedBlockName}__`)
      );
    });
  }

  function isClassPrefixMissing(className, blockName) {
    return (
      options.prefix.indexOf('') === -1 &&
      isBlockName(className, blockName, [''])
    );
  }
  
  function isBlockNameOneOf(className, blockList, authorizedBlockName) {
    return _.some(blockList, blockName => {
      return (
        blockName !== authorizedBlockName &&
        isBlockName(className, blockName)
      );
    });
  }
  
  // Checker
  function checkInternalClassName($, filePath, blockName) {
    eachWrapper($('class').find('identifier'), wrapper => {
      const className = wrapper.node.value;
      if (!isBlockName(className, blockName)) {
        if (isClassPrefixMissing(className, blockName)) {
          addError(`".${className}" should have a component prefix.`, filePath, blockName, wrapper);
        } else {
          addError(`".${className}" is incoherent with the file name.`, filePath, blockName, wrapper);
        }
      }
    });
  }
  
  function checkExternalClassName($, filePath, blockList, authorizedBlockName) {
    eachWrapper($('class').find('identifier'), wrapper => {
      const className = wrapper.node.value;
      if (isBlockNameOneOf(className, blockList, authorizedBlockName)) {
        const blockName = getBlockNameFromClass(className);
        if (isBlockWithAPseudoClass($(wrapper))) {
          addWarning(`".${className}" is tolerated in this stylesheet.`, filePath, blockName, wrapper);
        } else {
          addError(`".${className}" should not be styled outside of its own stylesheet.`, filePath, blockName, wrapper);
        }
      }
    });
  }
  
  function checkBemSyntaxClassName($, filePath, blockName) {
    eachWrapper($('class').find('identifier'), wrapper => {
      const className = wrapper.node.value;
      if (options.checkLowerCase && className !== className.toLowerCase()) {
        addError(`".${className}" should be in lower case.`, filePath, blockName, wrapper);
      }
      if (/___/.test(className)) {
        addError(`".${className}" element should have only 2 underscores.`, filePath, blockName, wrapper);
      }
      if (/---/.test(className)) {
        addError(`".${className}" modifier should have only 2 dashes.`, filePath, blockName, wrapper);
      }
      if (/--[^-]+--/.test(className)) {
        addError(`".${className}" should have a single modifier.`, filePath, blockName, wrapper);
      }
      if (/__[^-]+__/.test(className)) {
        addError(`".${className}" should have a single depth of element.`, filePath, blockName, wrapper);
      }
      if (/--[^-]+__/.test(className)) {
        addError(`".${className}" represents an element of a modifier, it should be cut in 2 classes.`, filePath, blockName, wrapper);
      }
    });
  }
  
  // Main
  function bemLintFile(filePath, blockList) {
    const blockName = getBlockNameFromFile(filePath);
    
    return fs.readFile(filePath, {encoding:'utf8'})
      .then(data => {
        const ast = parse(data);
        const $ = createQueryAst(ast);
  
        checkBemSyntaxClassName($, filePath, blockName);
        if (blockList.indexOf(blockName) !== -1) {
          checkInternalClassName($, filePath, blockName);
        }
        checkExternalClassName($, filePath, blockList, blockName);
        addInfo('Parsed', filePath, blockName);
      })
      .catch(error => {
        addError('Impossible to parse source file', filePath, blockName);
        console.error(error);
      })
    ;
  }
};
