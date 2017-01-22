const {lint} = require('../../src/bemlinter.js');

describe('Bemlinter of multiple files', () => {
  it('should lint with crossed error', (done) => {
    lint(`${__dirname}/*.scss`, {prefix: ['c-']})
      .then(logs => {
        expect(logs).toMatchSnapshot();
        done();
      });
  });
  
  it('should lint with crossed error', (done) => {
    lint(`${__dirname}/*.scss`, {prefix: ['', 'c-']})
      .then(logs => {
        expect(logs).toMatchSnapshot();
        done();
      });
  });
});