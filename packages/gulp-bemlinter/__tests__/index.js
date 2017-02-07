const gulp = require('gulp');
const bemlinter = require('./../src/gulp-bemlinter.js');

describe('gulp-bemlinter', () => {
  it('should lint', (done) => {
    const spy = (output) => {
      expect(output).toMatchSnapshot();
      done();
    };
    
    gulp.src([
        '../bemlinter/__tests__/sources/*.scss',
        '!../bemlinter/__tests__/sources/ModuleAlright.scss'
      ])
      .pipe(bemlinter())
      .pipe(bemlinter.format(false, spy));
  });
});