const {validate} = require('../models/category.model');
const {Company} = require('../models/company.model');
const expect = require('chai').expect;
const mongoose = require('mongoose');
const config = require('config');
mongoose.Promise = global.Promise;
const Category = mongoose.model('Category');

let category;
let input;
let company;

describe('Testing the Category model', () =>{
    before((done) => {
        mongoose.connect(config.get('mongoConnectionString'), {useNewUrlParser: true, useCreateIndex: true});
        mongoose.connection.once('open', () => {
            //Resets the databse before creating the objects
            mongoose.connection.collections.companies.drop(() => {
                mongoose.connection.collections.categories.drop(() => {
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
                                _id: company._id,
                                name: company.name
                            }
                        });
                        done();
                    });
                })
            });
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

    describe('save()', () => {
        it('should save a category', (done) => {
            category.save((err, category) => {
                expect(err).to.not.exist;
                expect(category).to.exist;
                expect(category).to.not.be.null;
                done();
            });
        });
    });

    describe('findOne()', () => {
        it('should throw an error if given the wrong information', (done) => {
            let fakeID = 'Hello';
            Category.findOne({_id: fakeID}, (err, category) => {
                expect(err).to.exist;
                expect(err).to.not.be.null;
                expect(category).to.not.exist;
                done();
            });
        });

        it('should send back a category if given the right information', (done) => {
            Category.findOne({_id: category._id.toString()}, (err, category) => {
                expect(err).to.not.exist;
                expect(category).to.not.be.null;
                done();
            });
        });
    });

    describe('updateOne()', () => {
        it('should update the category if given the right information', (done) => {
            Category.updateOne({_id: category._id}, {name: 'CatTest'}, (err) => {
                expect(err).to.not.exist;
                done();
            });
        });

        it(`shouldn't update the category if given the wrong object id`, (done) => {
            Category.updateOne({_id: 'Hello'}, {name: 'Category'}, (err) => {
                expect(err).to.exist;
                expect(err).to.not.be.null;
                done();
            });
        });
    });

    describe('removeOne()', () => {
        it('should throw an error if given the wrong id', (done) => {
            Category.deleteOne({_id: 'Hello'}, (err, category) => {
                expect(err).to.exist;
                expect(err).to.not.be.null;
                expect(category).to.not.exist;
                done();
            });
        });

        it('should send back the deleted category if given the right information', (done) => {
            Category.deleteOne({_id: category._id}, (err, category) => {
                expect(err).to.not.exist;
                expect(category).to.exist;
                expect(category).to.not.be.null;
                done();
            });
        });
    });

    after((done) => {
        mongoose.connection.close();
        done();
    });
});