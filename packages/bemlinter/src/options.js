const _ = require('lodash');

// Settings
const defaultOptions = {
  excludeBlock: [],
  checkLowerCase: true,
  classPrefix: [''],
  filePattern: '([^.]*)\.s?css'
};

module.exports = (userOptions) => {
  const options = _.merge({}, defaultOptions, userOptions);
  options.classPrefix = _.reverse(_.sortBy(options.classPrefix));

  return options;
};