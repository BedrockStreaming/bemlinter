const _ = require('lodash');
const fs = require('mz/fs');
const colors = require('colors');
const globby = require('globby');
const {parse} = require('scss-parser');
const createQueryAst = require('query-ast');

// Local
const createBem = require('./bem.js');
const createResult = require('./result.js');
const createOptions = require('./options.js');

// AST
function eachWrapper(wrapper, fn) {
  for (let n of wrapper.nodes) { fn(n) }
}

function nodeToString(node) {
  const result = [];

  if (node.type === 'id') {
    result.push('#');
  } else if (node.type === 'class') {
    result.push('.');
  } else if (node.type === 'pseudo_class') {
    result.push(':');
  } else if (node.type === 'arguments') {
    result.push('(');
  }

  if (typeof node.value === 'string') {
    result.push(node.value);
  } else {
    result.push(node.value.reduce((acc, child) => acc + nodeToString(child), ''));
  }

  if (node.type === 'arguments') {
    result.push(')');
  }

  return result.join('');
}

function eachClassName($, fn) {
  eachWrapper($('class').find('identifier'), wrapper => {
    const className = wrapper.node.value;
    fn(className, wrapper);
  });
}

function isClassFollowedByAPseudoClass($wrapper) {
  return $wrapper.parent().next().get(0).type === 'pseudo_class';
}

function getIsIsolatedBlock(fileOptions, blockName) {
  return fileOptions.excludeBlock.indexOf(blockName) === -1;
}

function bemLintFileData(filePath, data, result, blockList, options) {
  const fileOptions = options.getFileOptions(filePath);
  const bem = createBem(fileOptions);
  const moduleName = fileOptions.name;
  const blockName = bem.getBlockNameFromFile(filePath);
  const isIsolatedBlock = getIsIsolatedBlock(fileOptions, blockName);
  if (isIsolatedBlock) {
    result.addBlock(moduleName, blockName);
  }
  const ast = parse(data);
  const $ = createQueryAst(ast);

  checkSelector();
  checkBemSyntaxClassName();
  if (isIsolatedBlock) {
    checkInternalClassName();
  }
  checkExternalClassName();

  // Checker
  function checkInternalClassName() {
    eachClassName($, (className, wrapper) => {
      if (!bem.isBlockName(className, blockName)) {
        if (bem.isClassPrefixMissing(className, blockName)) {
          result.addError(`".${className}" should have a block prefix.`, filePath, moduleName, blockName, wrapper);
        } else if (isClassFollowedByAPseudoClass($(wrapper))) {
          result.addWarning(`".${className}" is only tolerated in this stylesheet.`, filePath, moduleName, blockName, wrapper);
        } else {
          result.addError(`".${className}" is incoherent with the file name.`, filePath, moduleName, blockName, wrapper);
        }
      }
    });
  }

  function checkExternalClassName() {
    eachClassName($, (className, wrapper) => {
      if (!bem.isBlockName(className, blockName)) {
        const classPrefixList = options.getClassPrefixList();
        const classPrefix = classPrefixList.find(prefix => _.startsWith(className, prefix));
        const moduleName = options.getModuleNameByClassPrefix(classPrefix);
        const externalBlockName = bem.getBlockNameFromClass(className, classPrefix);

        if (moduleName && blockList.indexOf(externalBlockName) !== -1) {
          result.addError(`".${className}" should not be styled outside of its own stylesheet.`, filePath, moduleName, externalBlockName, wrapper);
        }
      }
    });
  }

  function checkBemSyntaxClassName() {
    eachClassName($, (className, wrapper) => {
      if (fileOptions.checkLowerCase && className !== className.toLowerCase()) {
        result.addError(`".${className}" should be in lower case.`, filePath, moduleName, blockName, wrapper);
      }
      if (/___/.test(className)) {
        result.addError(`".${className}" element should have only 2 underscores.`, filePath, moduleName, blockName, wrapper);
      }
      if (/---/.test(className)) {
        result.addError(`".${className}" modifier should have only 2 dashes.`, filePath, moduleName, blockName, wrapper);
      }
      if (/--[^-]+--/.test(className)) {
        result.addError(`".${className}" should have a single modifier.`, filePath, moduleName, blockName, wrapper);
      }
      if (/__[^-]+__/.test(className)) {
        result.addError(`".${className}" should have a single depth of element.`, filePath, moduleName, blockName, wrapper);
      }
      if (/--[^-]+__/.test(className)) {
        result.addError(`".${className}" represents an element of a modifier, it should be cut in 2 classes.`, filePath, moduleName, blockName, wrapper);
      }
    });
  }

  function checkSelector() {
    eachWrapper($('operator'), wrapper => {
      if (wrapper.node.value !== '&') {
        return true;
      }
      const next = $(wrapper).next();
      if (!next.length()) {
        return true;
      }
      const nextNodeType = next.get(0).type;
      if (['id', 'class', 'pseudo_class', 'punctuation', 'function', 'space'].indexOf(nextNodeType) === -1) {
        const selector = nodeToString(next.parent().get(0)).trim();
        result.addError(`"${selector}" should not concatenate classes.`, filePath, moduleName, blockName, wrapper);
      }
    });
  }
}

function getBlockList(filePathList, getFileOptions) {
  return _.filter(filePathList.map(filePath => {
    const fileOptions = getFileOptions(filePath);
    const bem = createBem(fileOptions);
    const blockName = bem.getBlockNameFromFile(filePath);

    return getIsIsolatedBlock(fileOptions, blockName) ? blockName : false;
  }));
}

// Exports
module.exports = (sources, userOptions = {}) => {
  const result = createResult();
  const options = createOptions(userOptions);
  const filePathList = globby.sync(sources);
  const blockList = getBlockList(filePathList, options.getFileOptions);

  return Promise.all(filePathList.map(filePath => {
    return fs.readFile(filePath, {encoding:'utf8'})
      .then(data => bemLintFileData(filePath, data, result, blockList, options))
      .catch(error => {
        const fileOptions = options.getFileOptions(filePath);
        const bem = createBem(fileOptions);
        const blockName = bem.getBlockNameFromFile(filePath);
        result.addError(`${error.message}`, filePath, fileOptions.name, blockName);
      });
    }))
    .then(() => {
      const snapshotFilePath = options.getOptions('snapshot');
      if (snapshotFilePath !== false) {
        result.addSnapshot(snapshotFilePath);
      }
      return result;
    })
    .catch(console.error);
};
