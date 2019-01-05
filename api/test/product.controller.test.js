const app = require('../index');
const chai = require('chai');
chai.use(require('chai-http'));
const expect = chai.expect;
const mongoose = require('mongoose');
const config = require('config');
const {Product} = require('../models/product.model');
const {Supplier} = require('../models/supplier.model');
const {User} = require('../models/user.model');

let product;
let input;
let supplier;
let token;

describe('Product controller', () => {
    before((done) => {
        mongoose.connect(config.get('mongoConnectionString'), {useNewUrlParser: true, useCreateIndex: true});
        mongoose.connection.once('open', () => {
            //Resets the databse before creating the objects
            mongoose.connection.dropDatabase(() => {
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
                    product.save((err, product) => {
                        let user = new User({
                            email: 'test@mail.com',
                            password: 'Password',
                            firstName: 'Name',
                            lastName: 'Surname',
                            company: {
                                name: 'Company'
                            },
                            locations: [
                                {
                                    name: 'Location'
                                }
                            ]
                        });
                        user.save((err, user) => {
                            token = user.generateAuthToken();
                            done();
                        });
                    });
                });
            });
        });
    });

    describe('Read all method', () => {
        it('should send an array with all the products in the database', (done) => {
            chai.request(app)
            .get('/api/products/')
            .set('Accept', 'application/json')
            .set('x-auth-token', token)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('array').and.has.lengthOf(1);
                expect(res.body[0]).to.have.property('name', product.name);
                done();
            });
        });
    });

    describe('Read single method', () => {
        it('should send an object with the same properties as the ones of the product with the given id', (done) => {
            chai.request(app)
            .get(`/api/products/${product._id}`)
            .set('Accept', 'application/json')
            .set('x-auth-token', token)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('name', product.name);

                done();
            });
        });

        it(`should send an easter egg if the given id isn't in the valid format`, (done) => {
            chai.request(app)
            .get('/api/products/fakeID')
            .set('Accept', 'application/json')
            .set('x-auth-token', token)
            .end((err, res) => {
                expect(res).to.have.status(418);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', `I'm a teapot. Don't ask me to brew coffee.`);
                done();
            });
        });

        it(`should send a 404 status code and an error message if there is no product with the given ID`, (done) => {
            chai.request(app)
            .get('/api/products/507f1f77bcf86cd799439011')
            .set('Accept', 'application/json')
            .set('x-auth-token', token)
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', 'There was no product with the given ID.');

                done();
            });
        });
    });

    describe('Create', () => {
        it('should send back the newly created product if given the right input', (done) => {
            chai.request(app)
            .post('/api/products/')
            .set('x-auth-token', token)
            .send(input)
            .then(res => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('name', input.name);
                done();
            });
        });

        it(`should send a 400 status code and an error message if the given input isn't valid`, (done) => {
            input.name = 'bl';
            chai.request(app)
            .post('/api/products/')
            .set('x-auth-token', token)
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

    describe('Update', () => {
        it(`should update the product with the given id`, (done) => {
            input.name = 'ProdTest'
            chai.request(app)
            .put(`/api/products/${product._id}`)
            .set('x-auth-token', token)
            .send(input)
            .then((res => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;

                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', 'The operation was successful.');
                done();
            }));
        });

        it(`should send an error message when sending an invalid input`, (done) => {
            input.name = 'bl';
            chai.request(app)
            .put(`/api/products/${product._id}`)
            .set('x-auth-token', token)
            .send(input)
            .then(res => {
                expect(res).to.have.status(400);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message');
                done();
            });
        });

        it(`should send an easter egg when sending an invalid id`, (done) => {
            input.name = 'Product';
            chai.request(app)
            .put('/api/products/FakeID')
            .set('x-auth-token', token)
            .send(input)
            .then(res => {
                expect(res).to.have.status(418);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', `I'm a teapot. Don't ask me to brew coffee.`);
                done();
            });
        });

        it(`should send an error message if the product doesn't exist`, (done) => {
            chai.request(app)
            .put('/api/products/507f1f77bcf86cd799439011')
            .set('x-auth-token', token)
            .send(input)
            .then(res => {
                expect(res).to.have.status(404);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', 'There was no product with the given ID.');
                done();
            });
        });
    });

    describe('Delete method', () => {
        it('should delete the product with the given id and send a success message', (done) => {
            chai.request(app)
            .del(`/api/products/${product._id}`)
            .set('x-auth-token', token)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', 'The operation was successful.');
                done();
            });
        });

        it(`should send an error message if the given id is invalid`, (done) => {
            chai.request(app)
            .del('/api/products/fakeID')
            .set('x-auth-token', token)
            .end((err, res) => {
                expect(res).to.have.status(418);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', `I'm a teapot. Don't ask me to brew coffee.`);
                done();
            });
        });

        it(`should send a 404 status code and error message if the product with the given ID doesn't exist`, (done) => {
            chai.request(app)
            .del('/api/products/507f1f77bcf86cd799439011')
            .set('x-auth-token', token)
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', `There was no product with the given ID`);
                done();
            });
        });
    });
});