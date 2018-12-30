const {Subcategory, validate} = require('../models/subcategory.model');
const {Product} = require('../models/product.model');
const {Category} = require('../models/category.model');
const expect = require('chai').expect;
const mongoose = require('mongoose');
const config = require('config');

let subcategory;
let input;
let product;
let category;

describe('Subcategory Model', () => {
    before((done) => {
        mongoose.connect(config.get('mongoConnectionString'), {useNewUrlParser: true, useCreateIndex: true});
        mongoose.connection.once('open', () => {
            //Resets the database before creating the objects
            mongoose.connection.collections.subcategories.drop(() => {
                mongoose.connection.collections.products.drop(() => {
                    product = new Product({
                        name: 'Product',
                        price: 10,
                        quantity: '1*10',
                        supplierReference: 'SUP-001',
                        supplier: {
                            name: 'Supplier'
                        }
                    });
                    category = new Category({
                        name: 'Category',
                        company: {
                            name: 'TestCo'
                        }
                    });
                    product.save((err, product) => {
                        category.save((err, category) => {
                            input = {
                                name: 'Subcategory',
                                category: category._id.toString(),
                                products: [
                                    product._id.toString()
                                ]
                            };

                            subcategory = new Subcategory({
                                name: input.name,
                                category: {
                                    _id: category._id,
                                    name: category.name
                                },
                                products: [
                                    {
                                        _id: product._id,
                                        name: product.name,
                                        supplierName: product.supplier.name,
                                        supplierReference: product.supplierReference
                                    }
                                ]
                            });
                            done();
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
            input.products = [];

            let result = validate(input);
            expect(result.error).to.not.be.null;
        });
    });

    describe('Save', () => {
        it(`should save a category`, (done) => {
            subcategory.save((err, subcategory) => {
                expect(err).to.not.exist;
                expect(subcategory).to.exist;
                expect(subcategory).to.not.be.null;
                done();
            });
        });
    });

    describe('Find', () => {
        it('should throw an error if given the wrong ID', (done) => {
            Subcategory.findOne({_id: 'Hello'}, (err, subcategory) => {
                expect(err).to.exist;
                expect(err).to.not.be.null;
                expect(subcategory).to.not.exist;
                done();
            });
        });

        it('should send back a subcategory if given the right ID', (done) => {
            Subcategory.findOne({_id: subcategory._id}, (err, subcategory) => {
                expect(err).to.not.exist;
                expect(subcategory).to.exist;
                expect(subcategory).to.not.be.null;
                done();
            });
        });
    });
});