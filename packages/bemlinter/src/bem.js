const _ = require('lodash');
const path = require('path');
const paramCase = require('param-case');

module.exports = function (classPrefixList) {
  
  function getBlockNameFromFile(filePath) {
    const fileName = path.basename(filePath);
    return paramCase(fileName.slice(0, fileName.length - 4));
  }

  function getBlockNameFromClass(className) {
    const blockName = className.split('__')[0].split('--')[0];
    const prefix = _.find(classPrefixList, prefix => _.startsWith(className, prefix));
    if (!prefix) {
      return blockName;
    }
    return blockName.slice(prefix.length);
  }

  function isBlockName(className, blockName, withPrefixList = classPrefixList) {
    return _.some(withPrefixList, prefix => {
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
      classPrefixList.indexOf('') === -1 &&
      isBlockName(className, blockName, [''])
    );
  }

  function isAnotherBlockName(className, blockList, actualBlockName) {
    return _.some(blockList, blockName => {
      return (
        blockName !== actualBlockName &&
        isBlockName(className, blockName, classPrefixList)
      );
    });
  }

  return {
    getBlockNameFromFile,
    getBlockNameFromClass,
    isBlockName,
    isClassPrefixMissing,
    isAnotherBlockName
  };
};