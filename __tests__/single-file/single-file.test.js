const bemlinter = require('./../../src/bemlinter');

describe('Bemlinter of alright.scss', () => {
  it('should lint without error', (done) => {
    bemlinter(`${__dirname}/alright.scss`)
      .then(logs => {
        expect(logs).toMatchSnapshot();
        done();
      });
  });
});

describe('Bemlinter of prefix.scss', () => {
  it('should lint with a missing prefix error', (done) => {
    bemlinter(`${__dirname}/prefix.scss`, [], {prefix: ['c-']})
      .then(logs => {
        expect(logs).toMatchSnapshot();
        done();
      });
  });
  
  it('should lint without error', (done) => {
    bemlinter(`${__dirname}/prefix.scss`, [], {prefix: ['', 'c-']})
      .then(logs => {
        expect(logs).toMatchSnapshot();
        done();
      });
  });
});

describe('Bemlinter of leak.scss', () => {
  it('should lint with a leak error', (done) => {
    bemlinter(`${__dirname}/leak.scss`)
      .then(logs => {
        expect(logs).toMatchSnapshot();
        done();
      });
  });
});

describe('Bemlinter of syntax.scss', () => {
  it('should lint with 6 different syntax error', (done) => {
    bemlinter(`${__dirname}/syntax.scss`)
      .then(logs => {
        expect(logs).toMatchSnapshot();
        done();
      });
  });
  
  it('should lint without a lower case error', (done) => {
    bemlinter(`${__dirname}/syntax.scss`, [], {checkLowerCase: false})
      .then(logs => {
        expect(logs).toMatchSnapshot();
        done();
      });
  });
});