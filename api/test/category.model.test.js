const app = require('../index');
const {Category, validate} = require('../models/category.model');
const {Company} = require('../models/company.model');
const expect = require('chai').expect;

let category;
let input;
let company;

describe('Testing the Category model', () =>{
    before((done) => {
        company = new Company({
            name: 'TestCo',
            email: 'testco@test.com',
            phone: '12345'
        });
        company.save((err, company) => {
            input = {
                name: 'Category',
                companyId: company._id.toString()
            };
            category = new Category({
                name: input.name,
                company: {
                    name: company.name
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
            let result = validate(input);
            expect(result.error).to.be.null;
            expect(result.value).to.not.be.null;
        });

        it(`shouldn't validate the input if one or more required member(s) is missing`, () => {
            input = {};
            let result = validate(input);
            expect(result.error).to.not.be.null;
        });

        it(`shouldn't validate the input if one or more member(s) doesn't satify the validation criteria`, () => {
            input.name = 'bla';
            input.companyId = company._id;
            let result = validate(input);
            expect(result.error).to.not.be.null;
        });
    });
});