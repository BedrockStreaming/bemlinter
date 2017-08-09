const { lint, format } = require('../src/bemlinter.js');
const fs = require('fs');

const toFilePath = (fileName, type) => `${__dirname}/${type}/${fileName}`;

const snapLintOutput = (lintResult) => {
  const output = format(lintResult, false);
  expect(output).toMatchSnapshot();

  return output;
};

const expectNewError = (lintResult, errorLength) => {
  expect(lintResult.getSnapshot().getNewErrorList().length).toBe(errorLength);

  return lintResult;
};

const expectFileCreated = filePath => {
  expect(fs.existsSync(filePath)).toBe(true);
  fs.unlinkSync(filePath);
};

const getLintResult = (stylesFileName, qualityFileName, options = {}) => {
  options.snapshot = toFilePath(qualityFileName, 'quality');
  return lint(toFilePath(stylesFileName, 'styles'), options);
};

describe('Bemlinter of alright.scss ', () => {
  let lintResult;

  beforeEach(function(done) {
    getLintResult('alright.scss', 'alright-snap.json')
      .catch(console.error)
      .then(result => lintResult = result)
      .then(done);
  });

  it('should lint without errors', () => {
    expectNewError(lintResult, 0);
    snapLintOutput(lintResult);
  });
});

describe('Bemlinter of alright.scss ', () => {
  let lintResult;

  beforeEach(function(done) {
    getLintResult('alright.scss', 'empty-snap.json')
      .catch(console.error)
      .then(result => lintResult = result)
      .then(done);
  });

  it('should create a quality snapshot', () => {
    expectFileCreated(toFilePath('empty-snap.json', 'quality'));
  });
});

describe('Bemlinter of leak.scss', () => {
  let lintResult;

  beforeEach(function(done) {
    getLintResult('leak.scss', 'leak-snap.json')
      .catch(console.error)
      .then(result => lintResult = result)
      .then(done);
  });

  it('should lint without new errors', () => {
    expectNewError(lintResult, 0);
    snapLintOutput(lintResult);
  });
});

describe('Bemlinter of leak.scss', () => {
  let lintResult;

  beforeEach(function(done) {
    getLintResult('leak.scss', 'alright-snap.json')
      .then(result => lintResult = result)
      .catch(console.error)
      .then(done);
  });

  it('should lint two new leak errors', () => {
    expectNewError(lintResult, 2);
    snapLintOutput(lintResult);
  });
});

describe('Bemlinter of leak.scss', () => {
  let lintResult;

  beforeEach(function(done) {
    getLintResult('leak.scss', 'alright-snap.json')
      .then(result => lintResult = result)
      .catch(console.error)
      .then(done);
  });

  it('should lint two new leak errors', () => {
    expectNewError(lintResult, 2);
    snapLintOutput(lintResult);
  });
});

describe('Bemlinter of leak.scss', () => {
  let lintResult;

  beforeEach(function(done) {
    getLintResult('leak.scss', 'new-snap.json')
      .then(result => lintResult = result)
      .catch(console.error)
      .then(done);
  });

  it('should create a quality snapshot without new errors', () => {
    expectNewError(lintResult, 0);
    expectFileCreated(toFilePath('new-snap.json', 'quality'));
  });
});
