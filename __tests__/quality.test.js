const { lint, format } = require('../src/bemlinter.js');
const fs = require('fs');

const toFilePath = (fileName, type) => `${__dirname}/${type}/${fileName}`;

const snapLintOutput = (lintResult) => {
  const output = format(lintResult, false);
  expect(output).toMatchSnapshot();

  return output;
};

const expectNewError = errorLength => (lintResult) => {
  expect(lintResult.getSnapshot().getNewErrorList().length).toBe(errorLength);

  return lintResult;
};

const expectFileCreated = filePath => (lintResult) => {
  expect(fs.existsSync(filePath)).toBe(true);
  fs.unlinkSync(filePath);

  return lintResult;
};

const getLintResult = (stylesFileName, qualityFileName, options = {}) => {
  options.snapshot = toFilePath(qualityFileName, 'quality');
  return lint(toFilePath(stylesFileName, 'styles'), options);
};

describe('Bemlinter of alright.scss ', () => {
  it('should lint without errors', done => (
    getLintResult('alright.scss', 'alright-snap.json')
      .then(expectNewError(0))
      .then(snapLintOutput)
      .catch(console.error)
      .then(done)
  ));

  it('should create a quality snapshot', done => (
    getLintResult('alright.scss', 'empty-snap.json')
      .then(expectFileCreated(toFilePath('empty-snap.json', 'quality')))
      .catch(console.error)
      .then(done)
  ));
});

describe('Bemlinter of leak.scss ', () => {
  it('should lint without new errors', done => (
    getLintResult('leak.scss', 'leak-snap.json')
      .then(expectNewError(0))
      .then(snapLintOutput)
      .catch(console.error)
      .then(done)
  ));

  it('should lint a new leak error', done => (
    getLintResult('leak.scss', 'alright-snap.json')
      .then(expectNewError(1))
      .then(snapLintOutput)
      .catch(console.error)
      .then(done)
  ));

  it('should create a quality snapshot without new errors', done => (
    getLintResult('leak.scss', 'new-snap.json')
      .then(expectNewError(0))
      .then(expectFileCreated(toFilePath('new-snap.json', 'quality')))
      .catch(console.error)
      .then(done)
  ));
});
