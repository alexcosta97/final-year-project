const {Product, validate} = require('../models/product.model');
const {Supplier} = require('../models/supplier.model');
const expect = require('chai').expect;
const mongoose = require('mongoose');
const config = require('config');

let product;
let input;
let supplier;

describe('Product Model', () => {
    before((done) => {
        mongoose.connect(config.get('mongoConnectionString'), {useNewUrlParser: true, useCreateIndex: true});
        mongoose.connection.once('open', () => {
            //Resets the database before creating the new model objects
            mongoose.connection.collections.products.drop(() => {
                mongoose.connection.collections.suppliers.drop(() => {
                    supplier = new Supplier({
                        name: 'Supplier',
                        phone: '12345',
                        email: 'supplier@test.com'
                    });
                    supplier.save((err, supplier) => {
                        input = {
                            name: 'Product',
                            price: 10,
                            quantity: '1*10',
                            supplierReference: 'SUP-001',
                            supplierId: supplier._id.toString()
                        };
                        product = new Product({
                            name: input.name,
                            price: input.price,
                            quantity: input.quantity,
                            supplierReference: input.supplierReference,
                            supplier: {
                                _id: supplier._id,
                                name: supplier.name
                            }
                        });
                        done();
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
            input.quantity = '';
            input.price = -1;

            let result = validate(input);
            expect(result.error).to.not.be.null;
        });
    });

    describe('Save', () => {
        it(`should save a product`, (done) => {
            product.save((err, product) => {
                expect(err).to.not.exist;
                expect(product).to.exist;
                expect(product).to.not.be.null;
                done();
            });
        });
    });

    describe('Find', () => {
        it('should throw an error if given the wrong ID', (done) => {
            Product.findOne({_id: 'Hello'}, (err, product) => {
                expect(err).to.exist;
                expect(err).to.not.be.null;
                expect(product).to.not.exist;
                done();
            });
        });

        it('should send back a product if given the right ID', (done) => {
            Product.findOne({_id: product._id}, (err, product) => {
                expect(err).to.not.exist;
                expect(product).to.exist;
                expect(product).to.not.be.null;
                done();
            });
        });
    });

    describe('Update', () => {
        it(`should update the product if given the right information`, (done) => {
            Product.updateOne({_id: product._id},
                {name: 'ProdTest'}, (err) => {
                    expect(err).to.not.exist;
                    done();
                });
        });

        it(`shouldn't update the product if given the wrong object id`, (done) => {
            Product.updateOne({_id: 'FakeID'}, {name: 'Product'}, (err) => {
                expect(err).to.exist;
                expect(err).to.not.be.null;
                done();
            });
        });
    });

    describe('Remove', () => {
        it(`should throw an error if given the wrong object id`, (done) => {
            Product.deleteOne({_id: 'FakeID'}, (err, product) => {
                expect(err).to.exist;
                expect(err).to.not.be.null;
                expect(product).to.not.exist;
                done();
            });
        });

        it(`should send back the deleted subcategory if given the right id`, (done) => {
            Product.deleteOne({_id: product._id}, (err, product) => {
                expect(err).to.not.exist;
                expect(product).to.exist;
                expect(product).to.not.be.null;
                done();
            });
        });
    });
})