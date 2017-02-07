const _ = require('lodash');
const globby = require('globby');

// Settings
const defaultModuleOptions = {
  excludeBlock: [],
  checkLowerCase: true,
  classPrefix: '',
  filePattern: '([^.]*)\.s?css'
};

function createOptions(userOptions, isRoot = true) {
  const options = _.merge({}, defaultModuleOptions, userOptions);
  if (isRoot) {
    options.modules = (options.modules || []).map(moduleOptions => {
      if (!moduleOptions.name) {
        console.error('Your module should have a name');
      }
      if (!moduleOptions.sources) {
        console.error(`Your module "${moduleOptions.name}" should have sources`);
      }
      if (typeof moduleOptions.sources === 'string') {
        moduleOptions.sources = [moduleOptions.sources];
      }
      return _.merge({}, _.omit(options, 'modules'), createOptions(moduleOptions, false));
    });
    options.name = '__root';
  }
  
  return options;
}

module.exports = userOptions => {
  const options = createOptions(userOptions);
  
  function getFileOptions(filePath) {
    const fileOptions = _.find(options.modules, moduleOptions => {
      const globbyResult = globby.sync([filePath, ...moduleOptions.sources.map(modulePath => `!${modulePath}`)]);
      return !globbyResult.length;
    });
    
    return fileOptions || options;
  }
  
  function getClassPrefixList() {
    const classPrefixList = _.uniq([options.classPrefix].concat(_.map(options.modules, 'classPrefix')));
    return _.reverse(_.sortBy(classPrefixList, 'length'));
  }

  function getModuleNameByClassPrefix(classPrefix) {
    if (options.classPrefix === classPrefix) {
      return options.name;
    }
    
    const module = options.modules.find(moduleOptions => moduleOptions.classPrefix === classPrefix);
    if (!module) {
      return false
    }
    return module.name;
  }
  
  return {getFileOptions, getClassPrefixList, getModuleNameByClassPrefix}
};