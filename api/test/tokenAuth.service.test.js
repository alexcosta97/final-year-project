const {User} = require('../models/user.model');
const {Location} = require('../models/location.model');
const {Company} = require('../models/company.model');
const chai = require('chai');
chai.use(require('chai-http'));
chai.use(require('chai-jwt'));
const expect = chai.expect;
const mongoose = require('mongoose');
const config = require('config');
const {decoder} = require('../services/tokenAuth');

let user;
let location;
let company;
let token;

describe('Token Authentication', () => {
    before((done) => {
        mongoose.connect(config.get('mongoConnectionString'), {useNewUrlParser: true, useCreateIndex: true});
        mongoose.connection.once('open', () => {
            //Resets the database before creating the new model objects
            mongoose.connection.dropDatabase((err) => {
                company = new Company({
                    name: 'TestCo',
                    email: 'testco@test.com',
                    phone: '12345'
                });
                company.save((err, company) => {
                    location = new Location({
                        name: 'Location',
                        phone: '12345',
                        company: {
                            _id: company._id,
                            name: company.name
                        },
                        email: 'mail@testco.com',
                        address: {
                            houseNumber: '1',
                            street: 'Street',
                            town: 'Town',
                            postCode: 'PC1',
                            country: 'Country'
                        }
                    });
                    location.save((err, location) => {
                        user = new User({
                            email: 'test@mail.com',
                            password: 'Password',
                            firstName: 'Name',
                            lastName: 'Surname',
                            company: {
                                _id: company._id,
                                name: company.name
                            },
                            locations: [
                                {
                                    _id: location._id,
                                    name: location.name
                                }
                            ]
                        });
                        user.save((err, user) => {
                            token = user.generateAuthToken();
                            done();
                        });
                    });
                });
            });
        });
    });

    it(`should decode the token and send an object with the user's id back`, () => {
        let decoded = decoder(token);
        expect(decoded).to.exist;
        expect(decoded).to.not.be.an('error');
        expect(decoded).to.be.an('object');
        expect(decoded).to.have.property('id', user._id.toString());
    });

    it('should send an error message if the token sent is invalid', () => {
        let error = decoder('fakeToken');
        expect(error).to.exist;
        expect(error).to.be.an('error');
        expect(error).to.have.property('message', 'Invalid Token');
    });
});