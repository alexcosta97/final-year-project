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

    describe('Read single method', () => {
        it('should send an object with the same properties as the ones of the location with the given id', (done) => {
            chai.request(app)
            .get(`/api/locations/${location._id}`)
            .set('Accept', 'application/json')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('name', location.name);
                expect(res.body).to.have.property('phone', location.phone);
                expect(res.body).to.have.property('email', location.email);

                done();
            });
        });

        it(`should send an easter egg if the given id isn't in the valid format`, (done) => {
            chai.request(app)
            .get('/api/locations/fakeID')
            .set('Accept', 'application/json')
            .end((err, res) => {
                expect(res).to.have.status(418);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', `I'm a teapot. Don't ask me to brew coffee.`);
                done();
            });
        });

        it(`should send a 404 status code and an error message if there is no location with the given ID`, (done) => {
            chai.request(app)
            .get('/api/locations/507f1f77bcf86cd799439011')
            .set('Accept', 'application/json')
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', 'There was no location with the given ID.');

                done();
            });
        });
    });

    describe('Create', () => {
        it('should send back the newly created location if given the right input', (done) => {
            chai.request(app)
            .post('/api/locations/')
            .send(input)
            .then(res => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('name', input.name);
                expect(res.body).to.have.property('phone', input.phone);
                expect(res.body).to.have.property('email', input.email);
                done();
            });
        });

        it(`should send a 400 status code and an error message if the given input isn't valid`, (done) => {
            input.email = 'mail';
            chai.request(app)
            .post('/api/locations/')
            .send(input)
            .then(res => {
                expect(res).to.have.status(400);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message');
                done();
            });
        });
    });

    describe('Update', () => {
        it(`should update the location with the given id`, (done) => {
            input.email = 'mail@supplierco.com';
            chai.request(app)
            .put(`/api/locations/${location._id}`)
            .send(input)
            .then((res => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;

                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', 'The operation was successful.');
                done();
            }));
        });

        it(`should send an error message when sending an invalid input`, (done) => {
            input.email = 'mail';
            chai.request(app)
            .put(`/api/locations/${location._id}`)
            .send(input)
            .then(res => {
                expect(res).to.have.status(400);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message');
                done();
            });
        });

        it(`should send an easter egg when sending an invalid id`, (done) => {
            input.email = 'mail@testco.com';
            chai.request(app)
            .put('/api/locations/FakeID')
            .send(input)
            .then(res => {
                expect(res).to.have.status(418);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', `I'm a teapot. Don't ask me to brew coffee.`);
                done();
            });
        });

        it(`should send an error message if the location doesn't exist`, (done) => {
            chai.request(app)
            .put('/api/locations/507f1f77bcf86cd799439011')
            .send(input)
            .then(res => {
                expect(res).to.have.status(404);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', 'There was no location with the given ID.');
                done();
            });
        });
    });
});