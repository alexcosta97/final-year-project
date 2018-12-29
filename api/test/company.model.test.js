const app = require('../index');
const {Company, validate} = require('../models/company.model');
const expect = require('chai').expect;

let companyDB;
let companyInput;

describe('Company Model Tests', () =>{
    //Setting up a clean sheet before each of the tests
    before((done) => {
        // Sets up the right input to an object
        // and the model object with the properties
        // from the input object
        companyInput = {
            name: 'TestCo',
            email: 'testco@test.com',
            phone: '789132434'
        };

        companyDB = new Company(companyInput);
        done();
    });

    //The tests for the validation method are more extensive
    // since the validation method is the one that always checks for the user input before information being sent to the model (post and put)
    // For the other types of request (get and delete), the tests must check if an error is thrown with a wrong id on top of checking that the response from the model is adequate

    describe('Testing the input validation method', () => {
        it('should validate a correct input object', () => {
            let result = validate(companyInput);
            expect(result.error).to.be.null;
            expect(result.value).to.not.be.null;
        });

        it(`shouldn't validate the input if a required member is missing`, () => {
            companyInput = {
                email: 'testco@test.com',
                phone: '789132434'
            };

            let result = validate(companyInput);

            expect(result.error).to.not.be.null;
        });

        it(`shouldn't validate the input if a member doesn't fulfill the min or max criteria`, () => {
            companyInput.phone = '123';

            let result = validate(companyInput);
            expect(result.error).to.not.be.null;
        });

        it(`shouldn't validate the input if the email isn't in the right format`, () => {
            companyInput.email = 'email';

            let result = validate(companyInput);
            expect(result.error).to.not.be.null;
        });
    });

    describe('Testing the save method', () => {
        it('should save an object with the required information', () => {
            companyDB.save((err, company) => {
                expect(err).to.be.null;
                expect(company).to.not.be.null;
            });
        });

        it(`should return an error object and no company when an info is wrong`, () => {
            companyDB.phone = '123';

            companyDB.save((err, company) => {
                expect(err).to.exist;
                expect(company).to.not.exist;
            });
        });
    });

    describe('Testing the find method', () => {
        it(`should return the result of a query`,() => {
            Company.findOne({_id: companyDB._id}, (err,company) => {
                expect(company).to.exist;
            });
        });
    });

    describe('Testing the update method', () => {
        it(`should update an existing object when given the right information`, () => {
            companyDB.updateOne({name: 'TestCompany'}, (err) => {
                expect(err).to.not.exist;
            });
        });
    });

    describe('Testing the remove method', () => {
        it(`should return an error when sending the wrong document`, () => {
            Company.deleteOne({_id: 'Hello'}, (err, company) => {
                expect(err).to.exist;
            });
        });

        it(`should remove the document from the database`, () => {
            companyDB.remove((err, company) => {
                expect(err).to.not.exist;
                Company.findById(company._id, (err, comp) => {
                    expect(comp).to.be.null;
                });
            });
        });
    });

    after((done) => {
        Company.deleteMany(() => {
            done();
        });
    });
});