const _ = require('lodash');
const globby = require('globby');

// Settings
const defaultProjectOptions = {
  excludeBlock: [],
  checkLowerCase: true,
  classPrefix: '',
  filePattern: '([^.]*)\.s?css'
};

function createOptions(userOptions, isRoot = true) {
  const options = _.merge({}, defaultProjectOptions, userOptions);
  if (isRoot) {
    options.project = (options.project || []).map(projectOptions => {
      if (!projectOptions.name) {
        console.error('Your project should have a name');
      }
      if (typeof projectOptions.sources === 'string') {
        projectOptions.sources = [projectOptions.sources];
      }
      return _.merge({}, _.omit(options, 'project'), createOptions(projectOptions, false));
    });
    options.name = '__root';
  }
  
  return options;
}

module.exports = userOptions => {
  const options = createOptions(userOptions);
  
  function getFileOptions(filePath) {
    const fileOptions = _.find(options.project, projectOptions => {
      const globbyResult = globby.sync([filePath, ...projectOptions.sources.map(projectPath => `!${projectPath}`)]);
      return !globbyResult.length;
    });
    
    return fileOptions || options;
  }
  
  function getClassPrefixList() {
    const classPrefixList = _.uniq([options.classPrefix].concat(_.map(options.project, 'classPrefix')));
    return _.reverse(_.sortBy(classPrefixList, 'length'));
  }

  function getProjectNameByClassPrefix(classPrefix) {
    if (options.classPrefix === classPrefix) {
      return options.name;
    }
    
    const project = options.project.find(projectOptions => projectOptions.classPrefix === classPrefix);
    if (!project) {
      return false
    }
    return project.name;
  }
  
  return {getFileOptions, getClassPrefixList, getProjectNameByClassPrefix}
};