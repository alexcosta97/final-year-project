const {Supplier, validate} = require('../models/supplier.model');
const expect = require('chai').expect;
const mongoose = require('mongoose');
const config = require('config');

let supplier;
let input;

describe('Supplier Model', () => {
    before((done) => {
        mongoose.connect(config.get('mongoConnectionString'), {useNewUrlParser: true, useCreateIndex: true});

        mongoose.connection.once('open', () => {
            //Resets the database before creating the new model objects
            mongoose.connection.collections.suppliers.drop(() => {
                input = {
                    name: 'Supplier',
                    phone: '12345',
                    email: 'supplier@testco.com',
                    fax: '12345'
                }
                supplier = new Supplier(input);
                done();
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
            input.phone = '123',
            input.email = 'mail';

            let result = validate(input);
            expect(result.error).to.not.be.null;
        });

        it(`should validate the input if one of the optional members is missing`, () => {
            input = {
                name: 'Supplier',
                phone: '12345',
                email: 'supplier@testco.com',
            }
            let result = validate(input);
            expect(result.error).to.be.null;
            expect(result.value).to.not.be.null;
        });
    });

    describe('Save', () => {
        it(`should save a product`, (done) => {
            supplier.save((err, supplier) => {
                expect(err).to.not.exist;
                expect(supplier).to.exist;
                expect(supplier).to.not.be.null;
                done();
            });
        });
    });

    describe('Find', () => {
        it('should throw an error if given the wrong ID', (done) => {
            Supplier.findOne({_id: 'Hello'}, (err, supplier) => {
                expect(err).to.exist;
                expect(err).to.not.be.null;
                expect(supplier).to.not.exist;
                done();
            });
        });

        it('should send back a product if given the right ID', (done) => {
            Supplier.findOne({_id: supplier._id}, (err, supplier) => {
                expect(err).to.not.exist;
                expect(supplier).to.exist;
                expect(supplier).to.not.be.null;
                done();
            });
        });
    });

    describe('Update', () => {
        it(`should update the product if given the right information`, (done) => {
            Supplier.updateOne({_id: supplier._id},
                {name: 'SupTest'}, (err) => {
                    expect(err).to.not.exist;
                    done();
                });
        });

        it(`shouldn't update the product if given the wrong object id`, (done) => {
            Supplier.updateOne({_id: 'FakeID'}, {name: 'Supplier'}, (err) => {
                expect(err).to.exist;
                expect(err).to.not.be.null;
                done();
            });
        });
    });

    describe('Remove', () => {
        it(`should throw an error if given the wrong object id`, (done) => {
            Supplier.deleteOne({_id: 'FakeID'}, (err, supplier) => {
                expect(err).to.exist;
                expect(err).to.not.be.null;
                expect(supplier).to.not.exist;
                done();
            });
        });

        it(`should send back the deleted subcategory if given the right id`, (done) => {
            Supplier.deleteOne({_id: supplier._id}, (err, supplier) => {
                expect(err).to.not.exist;
                expect(supplier).to.exist;
                expect(supplier).to.not.be.null;
                done();
            });
        });
    });
});