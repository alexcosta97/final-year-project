const app = require('../index');
const chai = require('chai');
chai.use(require('chai-http'));
chai.use(require('chai-jwt'));
const expect = chai.expect;
const config = require('config');
const mongoose = require('mongoose');
const {Company} = require('../models/company.model');
const {Location} = require('../models/location.model');
const {Supplier} = require('../models/supplier.model');
const {Category} = require('../models/category.model');
const {Product} = require('../models/product.model');
const {Subcategory} = require('../models/subcategory.model');
const {Template} = require('../models/template.model');
const {Order} = require('../models/order.model');
const {User} = require('../models/user.model');

let company, location, supplier, category, product, subcategory, template, order, user;
let token;
let input;

describe('Users Controller', () => {
    beforeEach((done) => {
        mongoose.connect(config.get('mongoConnectionString'), {useNewUrlParser: true, useCreateIndex: true});
        mongoose.connection.once('open', () => {
            mongoose.connection.dropDatabase(() => {
                company = new Company({
                    name: 'Company',
                    email: 'company@testco.com',
                    phone: '12345'
                });
                company.save((err, company) => {
                    location = new Location({
                        name: 'Head Office',
                        phone: company.phone,
                        company: company._id,
                        address: {
                            houseNumber: '1',
                            street: 'Street',
                            town: 'Town',
                            postCode: 'PC1',
                            country: 'Country'
                        }
                    });
                    location.save((err, location) => {
                        supplier = new Supplier({
                            name: 'Supplier',
                            phone: '12345',
                            email: 'test@supplier.com'
                        });
                        supplier.save((err, supplier) => {
                            category = new Category({
                                name: 'Category',
                                company: company._id
                            });
                            category.save((err, category) => {
                                subcategory = new Subcategory({
                                    name: 'Subcategory',
                                    company: company._id,
                                    category: category._id
                                });
                                subcategory.save((err, subcategory) => {
                                    template = new Template({
                                        name: 'Template',
                                        location: location._id,
                                        company: company._id,
                                        supplier: supplier._id,
                                        orderDays: [Date.now()]
                                    });
                                    product = new Product({
                                        name: 'Product',
                                        price: 10,
                                        quantity: '1*10',
                                        supplierReference: 'SUP-001',
                                        supplier: supplier._id,
                                        category: category._id,
                                        subcategory: subcategory._id
                                    });
                                    product.save((err, template) => {
                                        template.save((err, template) => {
                                            order = new Order({
                                                location: location._id,
                                                date: Date.now(),
                                                supplier: supplier._id,
                                                productsOrdered: [{
                                                    product: product._id,
                                                    quantity: 1
                                                }]
                                            });
                                            order.save((err, order) => {
                                                user = new User({
                                                    email: 'testuser@testco.com',
                                                    password: 'Password',
                                                    firstName: 'Test',
                                                    lastName: 'User',
                                                    company: company._id,
                                                    locations: [location._id.toString()],
                                                    role: 'Admin'
                                                });
                                                user.save((err, user) => {
                                                    token = user.generateAuthToken();
                                                    input = {
                                                        email: 'test@mail.com',
                                                        password: 'Password',
                                                        firstName: 'Name',
                                                        lastName: 'Surname',
                                                        company: company._id.toString(),
                                                        locations: [
                                                            location._id.toString()
                                                        ],
                                                        role: 'Admin'
                                                    };
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
            });
        });
    });

    describe('Get All Method', () => {
        it('should send back a list of users if the user is authenticated', (done) => {
            chai.request(app)
            .get('/api/users/')
            .set('Accept', 'application/json')
            .set('x-auth-token', token)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('array').and.to.have.length(1);
                expect(res.body[0]).to.have.property('email', user.email);
                done();
            });
        });
    });

    describe('Get One Method', () => {
        it('should get the user with the given id if the user is authenticated', (done) => {
            chai.request(app)
            .get(`/api/users/${user._id.toString()}`)
            .set('Accept', 'application/json')
            .set('x-auth-token', token)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('email', user.email);
                done();
            });
        });

        it('should send a 404 status if the user with the given ID does not exist', (done) => {
            chai.request(app)
            .get(`/api/users/507f1f77bcf86cd799439011`)
            .set('Acceot', 'application/json')
            .set('x-auth-token', token)
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', 'There was no user with the given ID.');
                done();
            });
        });

        it('should send a 400 status if the ID sent is invalid', (done) => {
            chai.request(app)
            .get(`/api/users/fakeID`)
            .set('Acceot', 'application/json')
            .set('x-auth-token', token)
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', 'Invalid User ID');
                done();
            });
        });
    });

    describe('POST Method', () => {
        it('should send back an user object and a token in the header if the input is correct', (done) => {
            chai.request(app)
            .post('/api/users')
            .set('Accept', 'application/json')
            .send(input)
            .then(res => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('email', input.email);
                expect(res).to.have.header('x-auth-token');
                done();
            });
        });

        it(`should send a 400 status code and an error message if the given input isn't valid`, (done) => {
            input = {};
            chai.request(app)
            .post('/api/users/')
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

    describe('PUT Method', () => {
        it(`should update the user with the given id and send a new token if the user being updated is the logged in user`, (done) => {
            input = {
                email: 'test@mail.com',
                password: 'Password',
                firstName: 'Name',
                lastName: 'Surname',
                company: company._id.toString(),
                locations: [
                    location._id.toString()
                ],
                role: 'Admin'
            };
            chai.request(app)
            .put(`/api/users/${user._id}`)
            .set('x-auth-token', token)
            .send(input)
            .then((res => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res).to.have.header('x-auth-token');
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', 'The operation was successful.');
                done();
            }));
        });

        it(`should send an error message when sending an invalid input`, (done) => {
            input = {};
            chai.request(app)
            .put(`/api/users/${user._id}`)
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
            input.email = 'test4@testco.com';
            chai.request(app)
            .put('/api/users/FakeID')
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

        it(`should send an error message if the user doesn't exist`, (done) => {
            input.email = 'test5@test.com';
            chai.request(app)
            .put('/api/users/507f1f77bcf86cd799439011')
            .set('x-auth-token', token)
            .send(input)
            .then(res => {
                expect(res).to.have.status(404);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', 'There was no user with the given ID.');
                done();
            });
        });
    });

    describe('DELETE method', () => {
        it('should delete the template with the given id and send a success message', (done) => {
            chai.request(app)
            .del(`/api/users/${user._id}`)
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
            .del('/api/users/fakeID')
            .set('x-auth-token', token)
            .end((err, res) => {
                expect(res).to.have.status(418);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', `I'm a teapot. Don't ask me to brew coffee.`);
                done();
            });
        });

        it(`should send a 404 status code and error message if the user with the given ID doesn't exist`, (done) => {
            chai.request(app)
            .del('/api/users/507f1f77bcf86cd799439011')
            .set('x-auth-token', token)
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', `There was no user with the given ID`);
                done();
            });
        });
    });
});