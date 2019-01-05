const app = require('../index');
const chai = require('chai');
chai.use(require('chai-http'));
const expect = chai.expect;
const mongoose = require('mongoose');
const config = require('config');
const {Company} = require('../models/company.model');
const {User} = require('../models/user.model');

let company;
let user;
let token;

describe('Company Controller', () => {
    before((done) => {
        mongoose.connect(config.get('mongoConnectionString'), {useNewUrlParser: true, useCreateIndex: true});
        mongoose.connection.once('open', () => {
            mongoose.connection.dropDatabase(() => {
                company = new Company({
                    name: 'TestCo',
                    email: 'mail@testco.com',
                    phone: '12345'
                });
                company.save((err, company) => {
                    user = new User({
                        email: 'test@mail.com',
                        password: 'Password',
                        firstName: 'Name',
                        lastName: 'Surname',
                        company: {
                            _id: company._id,
                            name: company.name
                        },
                        locations: [{name: 'Location'}]
                    });
                    user.save((err, user) => {
                        token = user.generateAuthToken();
                        done();
                    });
                });
            });
        });
    });

    describe('GET method', () => {
        it('should be able to get a specific company if the user is authenticated', (done) => {
            chai.request(app)
            .get(`/api/companies/${company._id.toString()}`)
            .set('x-auth-token', token)
            .set('Accept', 'application/json')
            .end((err, res) => {
                //Assertions about the response object
                expect(res).to.have.status(200);
                expect(res).to.be.json;

                //Assertions about the response body
                expect(res.body).to.be.an('object').and.to.have.property('name', company.name);
                expect(res.body).to.have.property('email', company.email);
                expect(res.body).to.have.property('phone', company.phone);
                done();
            });
        });

        it('should send a 401 status if no token is provided', (done) => {
            chai.request(app)
            .get(`/api/companies/${company._id.toString()}`)
            .set('Accept', 'application/json')
            .end((err, res) => {
                //Assertions about the response object
                expect(res).to.have.status(401);
                expect(res).to.be.json;

                //Assertions about the response body
                expect(res.body).to.be.an('object').and.to.have.property('message', 'Access denied. No token provided.');
                done();
            });
        });

        it('should send a 400 status if an invalid token is provided', (done) => {
            chai.request(app)
            .get(`/api/companies/${company._id.toString()}`)
            .set('x-auth-token', 'fakeToken')
            .set('Accept', 'application/json')
            .end((err, res) => {
                //Assertions about the response object
                expect(res).to.have.status(400);
                expect(res).to.be.json;

                //Assertions about the response body
                expect(res.body).to.be.an('object').and.to.have.property('message', 'Invalid Token');
                done();
            });
        });

        it(`should send a 400 status code and an error message if the parameter sent is not an object ID`, (done) => {
            chai.request(app)
            .get('/api/companies/fakeID')
            .set('x-auth-token', token)
            .end((err, res) => {
                //Assertions about the reponse object
                expect(res).to.have.status(400);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message');
                done();
            });
        });

        it(`should send a 404 status code and an error message if the parameter sent is an ID that doesn't exist in the datbase`, (done) => {
            //non-existent ID for this database copied from MongoDB's documentation
            chai.request(app)
            .get('/api/companies/507f1f77bcf86cd799439011')
            .set('x-auth-token', token)
            .end((err, res) => {
                //Assertions about the reponse object
                expect(res).to.have.status(404);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', 'There was no company with the given ID');
                done();
            });
        });
    });

    describe('POST method', () => {
        let input = {
            name: 'TestCo',
            email: 'mail@testco.com',
            phone: '12345'
        };

        it('should send back the newly created company if given the right input', (done) => {
            chai.request(app)
            .post('/api/companies')
            .send(input)
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;

                //Assertions about the response body
                expect(res.body).to.be.an('object').and.to.have.property('name', company.name);
                expect(res.body).to.have.property('email', company.email);
                expect(res.body).to.have.property('phone', company.phone);
                done();
            });
        });

        it(`should send an error message and status code 400 if received invalid input`, (done) => {
            input = {
                name: 'TestCo',
                phone: '12345'
            };

            chai.request(app)
            .post('/api/companies')
            .send(input)
            .then((res) => {
                expect(res).to.have.status(400);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message');
                done();
            });
        });
    });

    describe('PUT method', () => {
        let input = {
            name: 'TestinCo',
            email: 'mail@testinco.com',
            phone: '1234567'
        };

        it(`should update the company with the given id`, (done) => {
            chai.request(app)
            .put(`/api/companies/${company._id}`)
            .set('x-auth-token', token)
            .send(input)
            .then((res => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;

                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', 'The operation was successful.');
                done();
            }));
        });

        it(`should send a 401 status if no token is provided`, (done) => {
            chai.request(app)
            .put(`/api/companies/${company._id}`)
            .send(input)
            .then((res => {
                expect(res).to.have.status(401);
                expect(res).to.be.json;

                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', 'Access denied. No token provided.');
                done();
            }));
        });

        it(`should send a 400 status if token is invalid`, (done) => {
            chai.request(app)
            .put(`/api/companies/${company._id}`)
            .set('x-auth-token', 'fakeToken')
            .send(input)
            .then((res => {
                expect(res).to.have.status(400);
                expect(res).to.be.json;

                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', 'Invalid Token');
                done();
            }));
        });

        it(`should send an error message when sending an invalid input`, (done) => {
            input.email = 'mail';
            chai.request(app)
            .put(`/api/companies/${company._id}`)
            .set('x-auth-token', token)
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
            .put('/api/companies/FakeID')
            .set('x-auth-token', token)
            .send(input)
            .then(res => {
                expect(res).to.have.status(418);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', `I'm a teapot. Don't ask me to brew coffee.`);
                done();
            });
        });

        it(`should send an error message if the company doesn't exist`, (done) => {
            chai.request(app)
            .put('/api/companies/507f1f77bcf86cd799439011')
            .set('x-auth-token', token)
            .send(input)
            .then(res => {
                expect(res).to.have.status(404);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', 'There was no company with the given ID');
                done();
            });
        });
    });

    describe('Delete method', () => {
        it('should delete the company with the given id and send a success message', (done) => {
            chai.request(app)
            .del(`/api/companies/${company._id}`)
            .set('x-auth-token', token)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', 'The operation was successful.');
                done();
            });
        });

        it(`should send a 401 status if no token is provided`, (done) => {
            chai.request(app)
            .del(`/api/companies/${company._id}`)
            .then((res => {
                expect(res).to.have.status(401);
                expect(res).to.be.json;

                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', 'Access denied. No token provided.');
                done();
            }));
        });

        it(`should send a 400 status if token is invalid`, (done) => {
            chai.request(app)
            .del(`/api/companies/${company._id}`)
            .set('x-auth-token', 'fakeToken')
            .then((res => {
                expect(res).to.have.status(400);
                expect(res).to.be.json;

                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', 'Invalid Token');
                done();
            }));
        });

        it(`should send an error message if the given id is invalid`, (done) => {
            chai.request(app)
            .del('/api/companies/fakeID')
            .set('x-auth-token', token)
            .end((err, res) => {
                expect(res).to.have.status(418);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', `I'm a teapot. Don't ask me to brew coffee.`);
                done();
            });
        });

        it(`should send a 404 status code and error message if the company with the given ID doesn't exist`, (done) => {
            chai.request(app)
            .del('/api/companies/507f1f77bcf86cd799439011')
            .set('x-auth-token', token)
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', `There was no company with the given ID`);
                done();
            });
        });
    });
});