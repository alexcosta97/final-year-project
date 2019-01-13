const {Template, validate} = require('../models/template.model');
const {Location} = require('../models/location.model');
const {Subcategory} = require('../models/subcategory.model');
const expect = require('chai').expect;
const mongoose = require('mongoose');
const config = require('config');

let template;
let input;
let location;
let subcategory;

describe('Templates Model', () => {
    before((done) => {
        mongoose.connect(config.get('mongoConnectionString'), {useNewUrlParser: true, useCreateIndex: true});
        mongoose.connection.once('open', () => {
            //Resets the database before creating the new model objects
            mongoose.connection.collections.templates.drop(() => {
                mongoose.connection.collections.locations.drop(() => {
                    mongoose.connection.collections.subcategories.drop(() => {
                        location = new Location({
                            name: 'Location',
                            phone: '12345',
                            company: {
                                name: 'Company'
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

                        subcategory = new Subcategory({
                            name: 'Subcategory',
                            category: {
                                name: 'Category'
                            },
                            company: {
                                name: 'Company',
                            },
                            products: [
                                {
                                    name: 'Product',
                                    supplierName: 'Supplier',
                                    supplierReference: 'SUP-1'
                                }
                            ]
                        });

                        location.save((err, location) => {
                            subcategory.save((err, subcategory) => {
                                input = {
                                    name: 'Template',
                                    locations: [
                                        location._id.toString()
                                    ],
                                    subcategories: [
                                        subcategory._id.toString()
                                    ],
                                    orderDays: [
                                        Date.now()
                                    ]
                                };
                                template = new Template({
                                    name: input.name,
                                    location:{
                                        _id: location._id,
                                        name: location.name
                                    },
                                    company: {
                                        name: 'Company'
                                    },
                                    subcategories: [
                                        {
                                            name: subcategory.name,
                                            category: subcategory.category.name
                                        }
                                    ],
                                    orderDays: [
                                        Date.now()
                                    ]
                                });
                                done();
                            });
                        });
                    });
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
            input.name = 'bla';
            input.locations = [];
            input.subcategories = [];

            let result = validate(input);
            expect(result.error).to.not.be.null;
        });
    });

    describe('Save', () => {
        it(`should save a template`, (done) => {
            template.save((err, template) => {
                expect(err).to.not.exist;
                expect(template).to.exist;
                expect(template).to.not.be.null;
                done();
            });
        });
    });

    describe('Find', () => {
        it('should throw an error if given the wrong ID', (done) => {
            Template.findOne({_id: 'Hello'}, (err, template) => {
                expect(err).to.exist;
                expect(err).to.not.be.null;
                expect(template).to.not.exist;
                done();
            });
        });

        it('should send back a template if given the right ID', (done) => {
            Template.findOne({_id: template._id}, (err, template) => {
                expect(err).to.not.exist;
                expect(template).to.exist;
                expect(template).to.not.be.null;
                done();
            });
        });
    });

    describe('Update', () => {
        it(`should update the template if given the right information`, (done) => {
            Template.updateOne({_id: template._id},
                {name: 'TempTest'}, (err) => {
                    expect(err).to.not.exist;
                    done();
                });
        });

        it(`shouldn't update the template if given the wrong object id`, (done) => {
            Template.updateOne({_id: 'FakeID'}, {name: 'Template'}, (err) => {
                expect(err).to.exist;
                expect(err).to.not.be.null;
                done();
            });
        });
    });

    describe('Remove', () => {
        it(`should throw an error if given the wrong object id`, (done) => {
            Template.deleteOne({_id: 'FakeID'}, (err, template) => {
                expect(err).to.exist;
                expect(err).to.not.be.null;
                expect(template).to.not.exist;
                done();
            });
        });

        it(`should send back the deleted template if given the right id`, (done) => {
            Template.deleteOne({_id: template._id}, (err, template) => {
                expect(err).to.not.exist;
                expect(template).to.exist;
                expect(template).to.not.be.null;
                done();
            });
        });
    });
});