const {lint, format} = require('../src/bemlinter.js');

const snap = (fileName, done, options = {}) => {
  lint(`${__dirname}/sources/${fileName}`, options)
    .then(lintResult => format(lintResult, false))
    .then(output => {
      expect(output).toMatchSnapshot();
      done();
    })
    .catch(error => {
      console.error(error);
      done();
    })
  ;
};

describe('Bemlinter of crossed styled files', () => {
  it('should log error on both blocks', done => snap('cross-styling/*.scss', done, {classPrefix: 'c-'}));
  
  it('should not log error on the external block', done => snap('cross-styling/*.scss', done, {
    excludeBlock: ['external'],
    classPrefix: 'c-'
  }));
});

describe('Bemlinter of multi project files', () => {
  it('should detect the project and the missing prefix', done => snap('mixed-settings/*.scss', done, {
    project: [{
      name: 'project',
      sources: [`${__dirname}/sources/mixed-settings/project-prefixed.scss`],
      filePattern: 'project-([^.]*)\.scss'
    }]
  }));

  it('should detect the project and the associate leak styles', done => snap('mixed-settings/*.scss', done, {
    project: [{
      name: 'project',
      sources: [`${__dirname}/sources/mixed-settings/project-prefixed.scss`],
      classPrefix: 'c-',
      filePattern: 'project-([^.]*)\.scss'
    }]
  }));
});