const _ = require('lodash');
const path = require('path');
const paramCase = require('param-case');

module.exports = function (options) {
  const blockRegExp = new RegExp(options.filePattern);
  
  function getBlockNameFromFile(filePath) {
    const fileName = path.basename(filePath);
    const match = blockRegExp.exec(fileName);
    if (!match) {
      console.error(`No block name found for this ${fileName}. Is your filePattern option correct?`);
    } else if (match.length > 2) {
      console.error('Only one capturing group is authorized in filePattern!');
    }

    return paramCase(match[1]);
  }

  function getBlockNameFromClass(className) {
    const blockName = className.split('__')[0].split('--')[0];
    const currentClassPrefix = _.find(options.classPrefix, classPrefix => _.startsWith(className, classPrefix));
    if (!currentClassPrefix) {
      return blockName;
    }
    return blockName.slice(currentClassPrefix.length);
  }

  function isBlockName(className, blockName, withPrefixList = options.classPrefix) {
    return _.some(withPrefixList, classPrefix => {
      const prefixedBlockName = `${classPrefix}${blockName}`;
      return (
        className === prefixedBlockName ||
        _.startsWith(className, `${prefixedBlockName}--`) ||
        _.startsWith(className, `${prefixedBlockName}__`)
      );
    });
  }

  function isClassPrefixMissing(className, blockName) {
    return (
      options.classPrefix.indexOf('') === -1 &&
      isBlockName(className, blockName, [''])
    );
  }

  function isAnotherBlockName(className, blockList, actualBlockName) {
    return _.some(blockList, blockName => {
      return (
        blockName !== actualBlockName &&
        isBlockName(className, blockName, options.classPrefix)
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