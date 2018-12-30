const {User, validate} = require('../models/user.model');
const {Location} = require('../models/location.model');
const {Company} = require('../models/company.model');
const expect = require('chai').expect;
const mongoose = require('mongoose');
const config = require('config');

let user;
let input;
let location;
let company;

describe('Users Model', () => {
    before((done) => {
        mongoose.connect(config.get('mongoConnectionString'), {useNewUrlParser: true, useCreateIndex: true});
        mongoose.connection.once('open', () => {
            //Resets the database before creating the new model objects
            mongoose.connection.collections.locations.drop(() => {
                mongoose.connection.collections.companies.drop(() => {
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
                            input = {
                                email: 'test@mail.com',
                                password: 'Password',
                                firstName: 'Name',
                                lastName: 'Surname',
                                companyId: company._id.toString(),
                                locations: [
                                    location._id.toString()
                                ]
                            };
                            user = new User({
                                email: input.email,
                                password: input.password,
                                firstName: input.firstName,
                                lastName: input.lastName,
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
                            done();
                        });
                    })
                });
            });
        });
    });

    describe('Validate', () => {
        it('should validate a correct input object', () => {
            let result = validate(input);
            expect(result.error).to.be.null;
            expect(result.value).to.not.be.null;
        });

        it(`shouldn't validate the input if one or more required member(s) are missing`, () => {
            input = {};
            let result = validate(input);
            expect(result.error).to.not.be.null;
        });

        it(`shouldn't validate the input if one or more member(s) don't satisfy the validation criteria`, () => {
            input.email = 'mail';
            input.password = '';
            input.firstName = 'Oi';
            input.lastName = 'Tu';
            input.companyId = 'Hello';
            input.locations = [];

            let result = validate(input);
            expect(result.error).to.not.be.null;
        });
    });

    describe('Save', () => {
        it(`should save a user`, (done) => {
            user.save((err, user) => {
                expect(err).to.not.exist;
                expect(user).to.exist;
                expect(user).to.not.be.null;
                done();
            });
        });
    });

    describe('Find', () => {
        it('should throw an error if given the wrong ID', (done) => {
            User.findOne({_id: 'Hello'}, (err, user) => {
                expect(err).to.exist;
                expect(err).to.not.be.null;
                expect(user).to.not.exist;
                done();
            });
        });

        it('should send back a user if given the right ID', (done) => {
            User.findOne({_id: user._id}, (err, user) => {
                expect(err).to.not.exist;
                expect(user).to.exist;
                expect(user).to.not.be.null;
                done();
            });
        });
    });

    describe('Update', () => {
        it(`should update the user if given the right information`, (done) => {
            User.updateOne({_id: user._id},
                {name: 'UserTest'}, (err) => {
                    expect(err).to.not.exist;
                    done();
                });
        });

        it(`shouldn't update the user if given the wrong object id`, (done) => {
            User.updateOne({_id: 'FakeID'}, {name: 'User'}, (err) => {
                expect(err).to.exist;
                expect(err).to.not.be.null;
                done();
            });
        });
    });

    describe('Remove', () => {
        it(`should throw an error if given the wrong object id`, (done) => {
            User.deleteOne({_id: 'FakeID'}, (err, user) => {
                expect(err).to.exist;
                expect(err).to.not.be.null;
                expect(user).to.not.exist;
                done();
            });
        });

        it(`should send back the deleted user if given the right id`, (done) => {
            User.deleteOne({_id: user._id}, (err, user) => {
                expect(err).to.not.exist;
                expect(user).to.exist;
                expect(user).to.not.be.null;
                done();
            });
        });
    });
});