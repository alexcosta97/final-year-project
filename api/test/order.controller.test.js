const app = require('../index');
const chai = require('chai');
chai.use(require('chai-http'));
const expect = chai.expect;
const mongoose = require('mongoose');
const config = require('config');
const {Order} = require('../models/order.model');
const {Location} = require('../models/location.model');
const {Supplier} = require('../models/supplier.model');
const {Product} = require('../models/product.model');
const {User} = require('../models/user.model');

let order;
let input;
let location;
let supplier;
let product;
let token;

describe('Order controller', () => {
    beforeEach((done) => {
        mongoose.connect(config.get('mongoConnectionString'), {useNewUrlParser: true, useCreateIndex: true});
        mongoose.connection.once('open', () => {
            //Resets the databse before creating the objects
            mongoose.connection.dropDatabase(() => {
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
                            order.save((err, order) => {
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
        });
    });

    describe('Read all method', () => {
        it('should send an array with all the orders in the database', (done) => {
            chai.request(app)
            .get('/api/orders/')
            .set('Accept', 'application/json')
            .set('x-auth-token', token)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('array').and.has.lengthOf(1);
                expect(res.body[0].location).to.have.property('name', order.location.name);
                done();
            });
        });
    });

    describe('Read single method', () => {
        it('should send an object with the same properties as the ones of the order with the given id', (done) => {
            chai.request(app)
            .get(`/api/orders/${order._id}`)
            .set('Accept', 'application/json')
            .set('x-auth-token', token)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body.location).to.have.property('name', order.location.name);

                done();
            });
        });

        it(`should send an easter egg if the given id isn't in the valid format`, (done) => {
            chai.request(app)
            .get('/api/orders/fakeID')
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

        it(`should send a 404 status code and an error message if there is no order with the given ID`, (done) => {
            chai.request(app)
            .get('/api/orders/507f1f77bcf86cd799439011')
            .set('x-auth-token', token)
            .set('Accept', 'application/json')
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', 'There was no order with the given ID.');

                done();
            });
        });
    });

    describe('Create', () => {
        it('should send back the newly created order if given the right input', (done) => {
            chai.request(app)
            .post('/api/orders/')
            .set('x-auth-token', token)
            .send(input)
            .then(res => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body.location).to.have.property('name', order.location.name);
                done();
            });
        });

        it(`should send a 400 status code and an error message if the given input isn't valid`, (done) => {
            input.location = 'bla';
            chai.request(app)
            .post('/api/orders/')
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
        it(`should update the order with the given id`, (done) => {
            chai.request(app)
            .put(`/api/orders/${order._id}`)
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
            input.locationId = 'bl';
            chai.request(app)
            .put(`/api/orders/${order._id}`)
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
            input.locationId = location._id;
            chai.request(app)
            .put('/api/orders/FakeID')
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

        it(`should send an error message if the order doesn't exist`, (done) => {
            chai.request(app)
            .put('/api/orders/507f1f77bcf86cd799439011')
            .set('x-auth-token', token)
            .send(input)
            .then(res => {
                expect(res).to.have.status(404);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', 'There was no order with the given ID.');
                done();
            });
        });
    });

    describe('Delete method', () => {
        it('should delete the order with the given id and send a success message', (done) => {
            chai.request(app)
            .del(`/api/orders/${order._id}`)
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
            .del('/api/orders/fakeID')
            .set('x-auth-token', token)
            .end((err, res) => {
                expect(res).to.have.status(418);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', `I'm a teapot. Don't ask me to brew coffee.`);
                done();
            });
        });

        it(`should send a 404 status code and error message if the order with the given ID doesn't exist`, (done) => {
            chai.request(app)
            .del('/api/orders/507f1f77bcf86cd799439011')
            .set('x-auth-token', token)
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', `There was no order with the given ID`);
                done();
            });
        });
    });
});