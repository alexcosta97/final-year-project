const app = require('../index');
const chai = require('chai');
chai.use(require('chai-http'));
const expect = chai.expect;
const mongoose = require('mongoose');
const config = require('config');
const {Supplier} = require('../models/supplier.model');

let supplier;
let input;

describe('Supplier Controller', () => {
    before((done) => {
        mongoose.connect(config.get('mongoConnectionString'), {useNewUrlParser: true, useCreateIndex: true});
        mongoose.connection.once('open', () => {
            mongoose.connection.collections.suppliers.drop(() => {
                input = {
                    name: 'SupplierCo',
                    phone: '12345',
                    email: 'mail@supplierco.com'
                };
                supplier = new Supplier(input);
                supplier.save((err, supplier) => {
                    done();
                });
            });
        });
    });

    describe('Read all method', () => {
        it('should send an array with all the suppliers in the database', (done) => {
            chai.request(app)
            .get('/api/suppliers/')
            .set('Accept', 'application/json')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('array').and.has.lengthOf(1);
                expect(res.body[0]).to.have.property('name', supplier.name);
                expect(res.body[0]).to.have.property('phone', supplier.phone);
                expect(res.body[0]).to.have.property('email', supplier.email);

                done();
            });
        });
    });
});