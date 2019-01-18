const {Order, validate} = require('../models/order.model');
const {Location} = require('../models/location.model');
const {Supplier} = require('../models/supplier.model');
const {Product} = require('../models/product.model');
const expect = require('chai').expect;
const mongoose = require('mongoose');
const config = require('config');

let order;
let input;
let product;
let location;
let supplier;

describe('Orders Model', () => {
    before((done) => {
        mongoose.connect(config.get('mongoConnectionString'), {useNewUrlParser: true, useCreateIndex: true});
        mongoose.connection.once('open', () => {
            //Resets the database before creating the new model objects
            mongoose.connection.collections.orders.drop(() => {
                mongoose.connection.collections.locations.drop(() => {
                    mongoose.connection.collections.suppliers.drop(() => {
                        mongoose.connection.collections.products.drop(() => {
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
                            supplier = new Supplier({
                                name: 'Supplier',
                                phone: '12345',
                                email: 'supplier@test.com'
                            });
                            product = new Product({
                                name: 'Product',
                                price: 10,
                                quantity: '1*10',
                                supplierReference: 'SUP-001',
                                supplier: {
                                    name: 'Supplier'
                                }
                            });
                            location.save((err, location) => {
                                supplier.save((err, supplier) => {
                                    product.save((err, product) => {
                                        input = {
                                            locationId: location._id.toString(),
                                            supplierId: supplier._id.toString(),
                                            productsOrdered: [
                                                {
                                                    productId: product._id.toString(),
                                                    quantity: 3
                                                }
                                            ]
                                        };
                                        order = new Order({
                                            location: {
                                                _id: location._id,
                                                name: location.name
                                            },
                                            date: Date.now(),
                                            supplier: {
                                                _id: supplier._id,
                                                name: supplier.name,
                                                email: supplier.email
                                            },
                                            productsOrdered: [
                                                {
                                                    product: {
                                                        _id: product._id,
                                                        name: product.name,
                                                        price: product.price,
                                                        supplierReference: product.supplierReference
                                                    },
                                                    quantity: input.productsOrdered[0].quantity
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
            input.productsOrdered = [];
            let result = validate(input);
            expect(result.error).to.not.be.null;
        });
    });

    describe('Save', () => {
        it(`should save an order`, (done) => {
            order.save((err, order) => {
                expect(err).to.not.exist;
                expect(order).to.exist;
                expect(order).to.not.be.null;
                done();
            });
        });
    });

    describe('Find', () => {
        it('should throw an error if given the wrong ID', (done) => {
            Order.findOne({_id: 'Hello'}, (err, order) => {
                expect(err).to.exist;
                expect(err).to.not.be.null;
                expect(order).to.not.exist;
                done();
            });
        });

        it('should send back an order if given the right ID', (done) => {
            Order.findOne({_id: order._id}, (err, order) => {
                expect(err).to.not.exist;
                expect(order).to.exist;
                expect(order).to.not.be.null;
                done();
            });
        });
    });

    describe('Update', () => {
        it(`should update the order if given the right information`, (done) => {
            Order.updateOne({_id: order._id},
                {name: 'OrderTest'}, (err) => {
                    expect(err).to.not.exist;
                    done();
                });
        });

        it(`shouldn't update the order if given the wrong object id`, (done) => {
            Order.updateOne({_id: 'FakeID'}, {name: 'Order'}, (err) => {
                expect(err).to.exist;
                expect(err).to.not.be.null;
                done();
            });
        });
    });

    describe('Remove', () => {
        it(`should throw an error if given the wrong object id`, (done) => {
            Order.deleteOne({_id: 'FakeID'}, (err, order) => {
                expect(err).to.exist;
                expect(err).to.not.be.null;
                expect(order).to.not.exist;
                done();
            });
        });

        it(`should send back the deleted order if given the right id`, (done) => {
            Order.deleteOne({_id: order._id}, (err, order) => {
                expect(err).to.not.exist;
                expect(order).to.exist;
                expect(order).to.not.be.null;
                done();
            });
        });
    });
});