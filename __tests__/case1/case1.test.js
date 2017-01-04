const bemlinter = require('./../../src/bemlinter');

it('renders correctly', (done) => {
  bemlinter(`${__dirname}/*.scss`)
    .then(logs => {
      expect(logs).toMatchSnapshot();
      done();
    });
});