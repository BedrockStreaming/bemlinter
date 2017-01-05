const bemlinter = require('./../../src/bemlinter');

it('should log one block linted without error', (done) => {
  bemlinter(`${__dirname}/alright.scss`)
    .then(logs => {
      expect(logs).toMatchSnapshot();
      done();
    });
});

it('should log one block linted with a leak error', (done) => {
  bemlinter(`${__dirname}/leak.scss`)
    .then(logs => {
      expect(logs).toMatchSnapshot();
      done();
    });
});

it('should log one block linted with 6 syntax error', (done) => {
  bemlinter(`${__dirname}/syntax.scss`)
    .then(logs => {
      expect(logs).toMatchSnapshot();
      done();
    });
});