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

    describe('Read single method', () => {
        it('should send an object with the same properties as the ones of the supplier with the given id', (done) => {
            chai.request(app)
            .get(`/api/suppliers/${supplier._id}`)
            .set('Accept', 'application/json')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('name', supplier.name);
                expect(res.body).to.have.property('phone', supplier.phone);
                expect(res.body).to.have.property('email', supplier.email);

                done();
            });
        });

        it(`should send an easter egg if the given id isn't in the valid format`, (done) => {
            chai.request(app)
            .get('/api/suppliers/fakeID')
            .set('Accept', 'application/json')
            .end((err, res) => {
                expect(res).to.have.status(418);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', `I'm a teapot. Don't ask me to brew coffee.`);
                done();
            });
        });

        it(`should send a 404 status code and an error message if there is no supplier with the given ID`, (done) => {
            chai.request(app)
            .get('/api/suppliers/507f1f77bcf86cd799439011')
            .set('Accept', 'application/json')
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', 'There was no supplier with the given ID.');

                done();
            });
        });
    });

    describe('Create', () => {
        it('should send back the newly created suppllier if given the right input', (done) => {
            chai.request(app)
            .post('/api/suppliers/')
            .send(input)
            .then(res => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('name', input.name);
                expect(res.body).to.have.property('phone', input.phone);
                expect(res.body).to.have.property('email', input.email);
                done();
            });
        });

        it(`should send a 400 status code and an error message if the given input isn't valid`, (done) => {
            input.email = 'mail';
            chai.request(app)
            .post('/api/suppliers/')
            .send(input)
            .then(res => {
                expect(res).to.have.status(400);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message');
                done();
            });
        });
    });
});