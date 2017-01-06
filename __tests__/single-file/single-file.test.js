const bemlinter = require('./../../src/bemlinter');

it('should log a lint without error', (done) => {
  bemlinter(`${__dirname}/alright.scss`)
    .then(logs => {
      expect(logs).toMatchSnapshot();
      done();
    });
});

it('should log a lint with a leak error', (done) => {
  bemlinter(`${__dirname}/leak.scss`)
    .then(logs => {
      expect(logs).toMatchSnapshot();
      done();
    });
});

it('should log a lint with 6 syntax error', (done) => {
  bemlinter(`${__dirname}/syntax.scss`)
    .then(logs => {
      expect(logs).toMatchSnapshot();
      done();
    });
});

it('should log a lint without lower case error', (done) => {
  bemlinter(`${__dirname}/syntax.scss`, [], {checkLowerCase: false})
    .then(logs => {
      expect(logs).toMatchSnapshot();
      done();
    });
});