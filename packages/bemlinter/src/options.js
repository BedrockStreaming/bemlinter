const _ = require('lodash');
const globby = require('globby');

// Settings
const defaultProjectOptions = {
  excludeBlock: [],
  checkLowerCase: true,
  classPrefix: [''],
  filePattern: '([^.]*)\.s?css'
};

function createOptions(userOptions, isRoot = true) {
  const options = _.merge({}, defaultProjectOptions, userOptions);
  options.classPrefix = _.reverse(_.sortBy(options.classPrefix));
  if (isRoot) {
    options.project = options.project || [];
    options.project = options.project.map(projectOptions => {
      if (!projectOptions.name) {
        console.error('Your project should have a name');
      }
      if (typeof projectOptions.sources === 'string') {
        projectOptions.sources = [projectOptions.sources];
      }
      return _.merge({}, _.omit(options, 'project'), createOptions(projectOptions, false));
    });
  }
  
  return options;
}

module.exports = userOptions => {
  const options = createOptions(userOptions);
  
  return filePath => {
    const fileOptions = _.find(options.project, projectOptions => {
      const globbyResult = globby.sync([filePath, ...projectOptions.sources.map(projectPath => `!${projectPath}`)]);
      return !globbyResult.length;
    });
    
    return fileOptions || options;
  }
};