const app = require('../index');
const chai = require('chai');
chai.use(require('chai-http'));
const expect = chai.expect;
const mongoose = require('mongoose');
const config = require('config');
const {Location, validate} = require('../models/location.model');
const {Company} = require('../models/company.model');

let location;
let input;
let company;

describe('Location controller', () => {
    before((done) => {
        mongoose.connect(config.get('mongoConnectionString'), {useNewUrlParser: true, useCreateIndex: true});
        mongoose.connection.once('open', () => {
            //Resets the databse before creating the objects
            mongoose.connection.dropDatabase(() => {
                // Sets up the right input to an object
                // and the model object with the properties
                // from the input object
                company = new Company({
                    name: 'TestCo',
                    email: 'testco@test.com',
                    phone: '12345'
                });
                company.save((err, company) => {
                    input = {
                        name: 'TestLoc',
                        phone: '12345',
                        fax: '12345',
                        companyId: company._id.toString(),
                        email: 'testco@test.com',
                        houseNumber: '1',
                        street: 'Street',
                        town: 'Town',
                        postCode: 'PC1 1PC',
                        country: 'Country'
                    };
        
                    location = new Location({
                        name: input.name,
                        phone: input.phone,
                        fax: input.fax,
                        company: {
                            _id: company._id,
                            name: company.name
                        },
                        email: input.email,
                        address: {
                            houseNumber: input.houseNumber,
                            street: input.street,
                            town: input.town,
                            postCode: input.postCode,
                            country: input.country
                        }
                    });
                    location.save((err, location) => {
                        done();
                    });
                });
            });
        });
    });

    describe('Read all method', () => {
        it('should send an array with all the locations in the database', (done) => {
            chai.request(app)
            .get('/api/locations/')
            .set('Accept', 'application/json')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('array').and.has.lengthOf(1);
                expect(res.body[0]).to.have.property('name', location.name);
                done();
            });
        });
    });
});