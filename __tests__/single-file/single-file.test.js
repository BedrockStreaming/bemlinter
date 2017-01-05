const bemlinter = require('./../../src/bemlinter');

it('should render 1 block without error', (done) => {
  bemlinter(`${__dirname}/alright.scss`)
    .then(logs => {
      expect(logs).toMatchSnapshot();
      done();
    });
});

it('should render 1 block with a leak error', (done) => {
  bemlinter(`${__dirname}/leak.scss`)
    .then(logs => {
      expect(logs).toMatchSnapshot();
      done();
    });
});