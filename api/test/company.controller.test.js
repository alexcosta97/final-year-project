const app = require('../index');
const chai = require('chai');
chai.use(require('chai-http'));
const expect = chai.expect;
const {Company} = require('../models/company.model');

let company;

describe('Company Controller', () => {
    before((done) => {
        company = new Company({
            name: 'TestCo',
            email: 'mail@testco.com',
            phone: '12345'
        });
        company.save((err, company) => {
            if(err) done(err);
            done();
        });
    });

    describe('GET method', () => {
        it('should be able to get a specific company', (done) => {
            chai.request(app)
            .get(`/api/companies/${company._id.toString()}`)
            .set('Accept', 'application/json')
            .end((err, res) => {
                //Assertions about the response object
                expect(res).to.have.status(200);
                expect(res).to.be.json;

                //Assertions about the response body
                expect(res.body).to.be.an('object').and.to.have.property('name', company.name);
                expect(res.body).to.have.property('email', company.email);
                expect(res.body).to.have.property('phone', company.phone);
            });
        });
    });

    after((done) => {
        Company.remove().exec();
        done();
    })
});