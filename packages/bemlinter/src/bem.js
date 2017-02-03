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
      return fileName;
    } else if (match.length > 2) {
      console.error('Only one capturing group is authorized in filePattern!');
      return fileName;
    }

    return paramCase(match[1]);
  }

  function getBlockNameFromClass(className) {
    const blockName = className.split('__')[0].split('--')[0];
    if (_.startsWith(className, options.classPrefix)) {
      return blockName.slice(options.classPrefix.length);
    }
    return blockName;
  }

  function isBlockName(className, blockName, classPrefix = options.classPrefix) {
    const prefixedBlockName = `${classPrefix}${blockName}`;
    return (
      className === prefixedBlockName ||
      _.startsWith(className, `${prefixedBlockName}--`) ||
      _.startsWith(className, `${prefixedBlockName}__`)
    );
  }

  function isClassPrefixMissing(className, blockName) {
    return (
      options.classPrefix !== '' &&
      isBlockName(className, blockName, '')
    );
  }

  function isAnotherBlockName(className, blockList, actualBlockName) {
    return _.some(blockList, blockName => {
      return (
        blockName !== actualBlockName &&
        // TODO: Find the project according to the block prefix 
        isBlockName(className, blockName)
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