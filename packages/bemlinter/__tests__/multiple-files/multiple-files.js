const bemlinter = require('./../../src/bemlinter');

describe('Bemlinter of multiple files', () => {
  it('should lint with crossed error', (done) => {
    bemlinter(`${__dirname}/*.scss`, {prefix: ['c-']})
      .then(logs => {
        expect(logs).toMatchSnapshot();
        done();
      });
  });
  
  it('should lint with crossed error', (done) => {
    bemlinter(`${__dirname}/*.scss`, {prefix: ['', 'c-']})
      .then(logs => {
        expect(logs).toMatchSnapshot();
        done();
      });
  });
});