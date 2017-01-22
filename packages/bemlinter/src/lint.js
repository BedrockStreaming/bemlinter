const _ = require('lodash');
const fs = require('mz/fs');
const colors = require('colors');
const globby = require('globby');
const {parse} = require('scss-parser');
const createQueryAst = require('query-ast');

// Local
const createBem = require('./bem.js');
const createResult = require('./result.js');

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
  const result = createResult();
  const options = _.merge({}, defaultOptions, userOptions);
  const classPrefixList = _.reverse(_.sortBy(options.prefix));
  const bem = createBem(classPrefixList);
  const blockList = globby.sync(sources, {
    ignore: options.excludeComponent
  }).map(bem.getBlockNameFromFile);

  return bemLintProject();

  // Main
  function bemLintProject() {
    const filePathList = globby.sync(sources);
    
    return Promise.all(filePathList.map(filePath => bemLintFile(filePath)))
      .then(() => {
        return _.mapValues(
          groupByAndOmit(_.flatten(result.getLogs()), 'blockName'),
          blockLog => groupByAndOmit(blockLog, 'type')
        );
      })
      .catch(console.error)
    ;
  }
  
  function bemLintFile(filePath) {
    const blockName = bem.getBlockNameFromFile(filePath);

    return fs.readFile(filePath, {encoding:'utf8'})
      .then(data => {
        const ast = parse(data);
        const $ = createQueryAst(ast);

        checkBemSyntaxClassName($, filePath, blockName);
        if (blockList.indexOf(blockName) !== -1) {
          checkInternalClassName($, filePath, blockName);
        }
        checkExternalClassName($, filePath, blockName);
        result.addInfo('Parsed', filePath, blockName);
      })
      .catch(error => {
        result.addError('Impossible to parse source file', filePath, blockName);
        console.error(error);
      })
      ;
  }

  // Checker
  function checkInternalClassName($, filePath, blockName) {
    eachWrapper($('class').find('identifier'), wrapper => {
      const className = wrapper.node.value;
      if (!bem.isBlockName(className, blockName)) {
        if (bem.isClassPrefixMissing(className, blockName)) {
          result.addError(`".${className}" should have a component prefix.`, filePath, blockName, wrapper);
        } else {
          result.addError(`".${className}" is incoherent with the file name.`, filePath, blockName, wrapper);
        }
      }
    });
  }

  function checkExternalClassName($, filePath, authorizedBlockName) {
    eachWrapper($('class').find('identifier'), wrapper => {
      const className = wrapper.node.value;
      if (bem.isAnotherBlockName(className, blockList, authorizedBlockName)) {
        const blockName = bem.getBlockNameFromClass(className);
        if (bem.isBlockWithAPseudoClass($(wrapper))) {
          result.addWarning(`".${className}" is tolerated in this stylesheet.`, filePath, blockName, wrapper);
        } else {
          result.addError(`".${className}" should not be styled outside of its own stylesheet.`, filePath, blockName, wrapper);
        }
      }
    });
  }

  function checkBemSyntaxClassName($, filePath, blockName) {
    eachWrapper($('class').find('identifier'), wrapper => {
      const className = wrapper.node.value;
      if (options.checkLowerCase && className !== className.toLowerCase()) {
        result.addError(`".${className}" should be in lower case.`, filePath, blockName, wrapper);
      }
      if (/___/.test(className)) {
        result.addError(`".${className}" element should have only 2 underscores.`, filePath, blockName, wrapper);
      }
      if (/---/.test(className)) {
        result.addError(`".${className}" modifier should have only 2 dashes.`, filePath, blockName, wrapper);
      }
      if (/--[^-]+--/.test(className)) {
        result.addError(`".${className}" should have a single modifier.`, filePath, blockName, wrapper);
      }
      if (/__[^-]+__/.test(className)) {
        result.addError(`".${className}" should have a single depth of element.`, filePath, blockName, wrapper);
      }
      if (/--[^-]+__/.test(className)) {
        result.addError(`".${className}" represents an element of a modifier, it should be cut in 2 classes.`, filePath, blockName, wrapper);
      }
    });
  }
};
