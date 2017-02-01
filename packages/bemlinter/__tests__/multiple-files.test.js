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

describe('Bemlinter of multiple files', () => {
  it('should lint with crossed error', done => snap('cross-styling/*.scss', done, {classPrefix: ['c-']}));
  
  it('should lint without the crossed error on the excluded block', done => snap('cross-styling/*.scss', done, {
    excludeBlock: ['other-block'],
    classPrefix: ['c-']
  }));
});