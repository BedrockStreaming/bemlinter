const { lint, format } = require('../src/bemlinter.js');

const snapLintOutput = (fileName, done, options = {}) => {
  lint(`${__dirname}/styles/${fileName}`, options)
    .then(lintResult => format(lintResult, false))
    .then((output) => {
      expect(output).toMatchSnapshot();
    })
    .catch(console.error)
    .then(done)
  ;
};

describe('Bemlinter of crossed styled files', () => {
  it('should log error on both blocks', done => snapLintOutput('cross-styling/*.scss', done, { classPrefix: 'c-' }));

  it('should not log error on the external block', done => snapLintOutput('cross-styling/*.scss', done, {
    excludeBlock: ['external'],
    classPrefix: 'c-',
  }));
});

describe('Bemlinter of multi-modules files', () => {
  it('should detect the module and the missing prefix', done => snapLintOutput('mixed-settings/*.scss', done, {
    modules: [{
      name: 'module',
      sources: ['./__tests__/styles/mixed-settings/module-prefixed.scss'],
      filePattern: 'module-([^.]*)\.scss',
    }],
  }));

  it('should detect the module and the associate leak styles', done => snapLintOutput('mixed-settings/*.scss', done, {
    modules: [{
      name: 'module',
      sources: ['./__tests__/styles/mixed-settings/module-prefixed.scss'],
      classPrefix: 'c-',
      filePattern: 'module-([^.]*)\.scss',
    }],
  }));
});
