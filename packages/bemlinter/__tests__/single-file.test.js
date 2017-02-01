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

describe('Bemlinter of alright.scss', () => {
  it('should lint without error', done => snap(`alright.scss`, done));
});

describe('Bemlinter of ProjectAlright.scss', () => {
  it('should lint without error', done => snap(`ProjectAlright.scss`, done, {
    filePattern: '(?:Project)?([^.]*)\.scss'
  }));
});

describe('Bemlinter of warning.scss', () => {
  it('should warn the use of an external block', done => snap(`warning.scss`, done));
});

describe('Bemlinter of prefix.scss', () => {
  it('should lint with a missing prefix error', done => snap(`prefix.scss`, done, {classPrefix: ['c-']}));
  
  it('should lint without error', done => snap(`prefix.scss`, done, {classPrefix: ['', 'c-']}));
});

describe('Bemlinter of leak.scss', () => {
  it('should lint with a leak error', done => snap(`leak.scss`, done));
});

describe('Bemlinter of leak.css', () => {
  it('should lint with a leak error', done => snap(`leak.css`, done));
});

describe('Bemlinter of syntax.scss', () => {
  it('should lint with 6 different syntax error', done => snap(`syntax.scss`, done));
  
  it('should lint without a lower case error', done => snap(`syntax.scss`, done, {checkLowerCase: false}));
});