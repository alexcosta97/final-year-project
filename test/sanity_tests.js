const expect = require('chai').expect;

describe('The World', () => {
    it('should say hello', () => {
        expect('Hello World').to.equal('Hello World');
    });

    it('should say hello asynchronously', (done) => {
        setTimeout(() => {
            expect('Hello World').to.equal('Hello World');
            done();
        }, 300);
    });
});