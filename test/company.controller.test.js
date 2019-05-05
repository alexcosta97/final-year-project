const app = require('../index');
const chai = require('chai');
chai.use(require('chai-http'));
const expect = chai.expect;
const mongoose = require('mongoose');
const config = require('config');
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

describe('Company Controller', () => {
    before((done) => {
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
                        company: company._id,
                        phone: company.phone,
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
                                    template.save((err, template) => {
                                        product = new Product({
                                            name: 'Product',
                                            price: 10,
                                            quantity: '1*10',
                                            supplierReference: 'SUP-001',
                                            supplier: supplier._id,
                                            category: category._id,
                                            subcategory: subcategory._id
                                        });
                                        product.save((err, product) => {
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
                                                    locations: [location._id],
                                                    role: 'Admin'
                                                });
                                                user.save((err, user) => {
                                                    token = user.generateAuthToken();
                                                    input = {
                                                        name: 'TestCo2',
                                                        email: 'testco2@testco.com',
                                                        phone: '12345',
                                                        houseNumber: '2',
                                                        street: 'Street',
                                                        town: 'Town',
                                                        postCode: 'PC2',
                                                        country: 'Country'
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

    describe('GET method', () => {
        it('should be able to get a specific company if the user is authenticated', (done) => {
            chai.request(app)
            .get(`/api/companies/${company._id.toString()}`)
            .set('x-auth-token', token)
            .set('Accept', 'application/json')
            .end((err, res) => {
                //Assertions about the response object
                expect(res).to.have.status(200);
                expect(res).to.be.json;

                //Assertions about the response body
                expect(res.body).to.be.an('object').and.to.have.property('name', company.name);
                expect(res.body).to.have.property('email', company.email);
                expect(res.body).to.have.property('phone', company.phone);
                done();
            });
        });

        it('should send a 401 status if no token is provided', (done) => {
            chai.request(app)
            .get(`/api/companies/${company._id.toString()}`)
            .set('Accept', 'application/json')
            .end((err, res) => {
                //Assertions about the response object
                expect(res).to.have.status(401);
                expect(res).to.be.json;

                //Assertions about the response body
                expect(res.body).to.be.an('object').and.to.have.property('message', 'Access denied. No token provided.');
                done();
            });
        });

        it('should send a 400 status if an invalid token is provided', (done) => {
            chai.request(app)
            .get(`/api/companies/${company._id.toString()}`)
            .set('x-auth-token', 'fakeToken')
            .set('Accept', 'application/json')
            .end((err, res) => {
                //Assertions about the response object
                expect(res).to.have.status(400);
                expect(res).to.be.json;

                //Assertions about the response body
                expect(res.body).to.be.an('object').and.to.have.property('message', 'Invalid Token');
                done();
            });
        });
    });

    describe('POST method', () => {
        it('should send back the newly created company if given the right input', (done) => {
            chai.request(app)
            .post('/api/companies')
            .send(input)
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;

                //Assertions about the response body
                expect(res.body).to.be.an('object').and.to.have.property('company');
                expect(res.body.company).to.have.property('email', input.email);
                expect(res.body.company).to.have.property('phone', input.phone);
                done();
            });
        });

        it(`should send an error message and status code 400 if received invalid input`, (done) => {
            input = {
                name: 'TestCo',
                phone: '12345'
            };

            chai.request(app)
            .post('/api/companies')
            .send(input)
            .then((res) => {
                expect(res).to.have.status(400);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message');
                done();
            });
        });
    });

    describe('PUT method', () => {
        it(`should update the company with the given id`, (done) => {
            input = {
                name: 'TestCo2',
                email: 'testco2@testco.com',
                phone: '12345',
                houseNumber: '2',
                street: 'Street',
                town: 'Town',
                postCode: 'PC2',
                country: 'Country'
            };
            chai.request(app)
            .put(`/api/companies/${company._id}`)
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

        it(`should send a 401 status if no token is provided`, (done) => {
            chai.request(app)
            .put(`/api/companies/${company._id}`)
            .send(input)
            .then((res => {
                expect(res).to.have.status(401);
                expect(res).to.be.json;

                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', 'Access denied. No token provided.');
                done();
            }));
        });

        it(`should send a 400 status if token is invalid`, (done) => {
            chai.request(app)
            .put(`/api/companies/${company._id}`)
            .set('x-auth-token', 'fakeToken')
            .send(input)
            .then((res => {
                expect(res).to.have.status(400);
                expect(res).to.be.json;

                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', 'Invalid Token');
                done();
            }));
        });

        it(`should send an error message when sending an invalid input`, (done) => {
            input.email = 'mail';
            chai.request(app)
            .put(`/api/companies/${company._id}`)
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

    describe('Delete method', () => {
        it('should delete the company with the given id and send a success message', (done) => {
            chai.request(app)
            .del(`/api/companies/${company._id}`)
            .set('x-auth-token', token)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', 'The operation was successful.');
                done();
            });
        });

        it(`should send a 401 status if no token is provided`, (done) => {
            chai.request(app)
            .del(`/api/companies/${company._id}`)
            .then((res => {
                expect(res).to.have.status(401);
                expect(res).to.be.json;

                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', 'Access denied. No token provided.');
                done();
            }));
        });

        it(`should send a 400 status if token is invalid`, (done) => {
            chai.request(app)
            .del(`/api/companies/${company._id}`)
            .set('x-auth-token', 'fakeToken')
            .then((res => {
                expect(res).to.have.status(400);
                expect(res).to.be.json;

                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', 'Invalid Token');
                done();
            }));
        });
    });
});