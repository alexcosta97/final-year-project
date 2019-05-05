const {Location, validate} = require('../models/location.model');
const {Company} = require('../models/company.model');
const expect = require('chai').expect;
const mongoose = require('mongoose');
const config = require('config');
mongoose.Promise = global.Promise;

let locationDB;
let locationInput;
let company;

describe('Testing the Locations Model', () => {
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
                    locationInput = {
                        name: 'TestLoc',
                        phone: '12345',
                        fax: '12345',
                        company: company._id.toString(),
                        email: 'testco@test.com',
                        houseNumber: '1',
                        street: 'Street',
                        town: 'Town',
                        postCode: 'PC1 1PC',
                        country: 'Country'
                    };
        
                    locationDB = new Location({
                        name: locationInput.name,
                        phone: locationInput.phone,
                        fax: locationInput.fax,
                        company: company._id,
                        email: locationInput.email,
                        address: {
                            houseNumber: locationInput.houseNumber,
                            street: locationInput.street,
                            town: locationInput.town,
                            postCode: locationInput.postCode,
                            country: locationInput.country
                        }
                    });
                    done();
                });
            });
        });
    });

    //The tests for the validation method are more extensive
    // since the validation method is the one that always checks for the user input before information being sent to the model (post and put)
    // For the other types of request (get and delete), the tests must check if an error is thrown with a wrong id on top of checking that the response from the model is adequate

    describe('validate()', () => {
        it(`should validate a correct input object`, () => {
            let result = validate(locationInput);
            expect(result.error).to.be.null;
            expect(result.value).to.not.be.null;
        });

        it(`shouldn't validate the input if one or more required member(s) is missing`, () => {
            locationInput = {};
            let result = validate(locationInput);
            expect(result.error).to.not.be.null;
        });

        it(`shouldn't validate the input if one or more member(s) doesn't satify the validation criteria`, () => {
            locationInput.phone = '123';
            locationInput.email = 'mail';
            let result = validate(locationInput);
            expect(result.error).to.not.be.null;
        });
    });

    describe('save()', () => {
        it('should save a location', (done) => {
            locationDB.save((err, location) => {
                expect(err).to.be.null;
                expect(location).to.not.be.null;
                done();
            });
        });
    })

    describe('findOne()', () => {
        it('should throw an error if given the wrong information', (done) => {
            let fakeID = 'Hello';
            Location.findOne({_id: fakeID}, (err, location) => {
                expect(err).to.exist;
                expect(err).to.not.be.null;
                expect(location).to.not.exist;
                done();
            });
        });

        it('should send back a location if given the right information', (done) => {
            Location.findOne({_id: locationDB._id}, (err, location) => {
                expect(err).to.not.exist;
                expect(location).to.not.be.null;
                done();
            });
        });
    });

    describe('updateOne()', () => {
        it('should update a location when given the right information', (done) => {
            Location.updateOne({_id: locationDB._id}, {name: 'Test Location'}, (err) => {
                expect(err).to.not.exist;
                done();
            });
        });
    });

    describe('removeOne()', () => {
        it('should throw an error if given the wrong information', (done) => {
            let fakeID = 'Hello';
            Location.deleteOne({_id: fakeID}, (err, location) => {
                expect(err).to.exist;
                expect(err).to.not.be.null;
                expect(location).to.not.exist;
                done();
            });
        });

        it('should send back a location if given the right information', (done) => {
            Location.deleteOne({_id: locationDB._id}, (err, location) => {
                expect(err).to.not.exist;
                expect(location).to.exist;
                expect(location).to.not.be.null;
                done();
            });
        });
    });

    after((done) => {
        mongoose.connection.close();
        done();
    });
});