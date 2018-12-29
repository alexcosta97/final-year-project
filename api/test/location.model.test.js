const app = require('../index');
const {Location, validate} = require('../models/location.model');
const {Company} = require('../models/company.model');
const expect = require('chai').expect;

let locationDB;
let locationInput;

describe('Testing the Locations Model', () => {
    before((done) => {
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
                companyId: company._id,
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
                company: {
                    name: company.name
                },
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

    after((done) => {
        Location.deleteMany(() => {
            Company.deleteMany(() => {
                done();
            });
        });
    });
});