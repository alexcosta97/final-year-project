const app = require('../index');
const chai = require('chai');
chai.use(require('chai-http'));
const expect = chai.expect;
const mongoose = require('mongoose');
const config = require('config');
const {Subcategory} = require('../models/subcategory.model');
const {Product} = require('../models/product.model');
const {Category} = require('../models/category.model');

let subcategory;
let input;
let product;
let category;

describe('Subcategory controller', () => {
    before((done) => {
        mongoose.connect(config.get('mongoConnectionString'), {useNewUrlParser: true, useCreateIndex: true});
        mongoose.connection.once('open', () => {
            //Resets the databse before creating the objects
            mongoose.connection.dropDatabase(() => {
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
                        subcategory.save((err, subcategory) => {
                            done();
                        });
                    });
                });
            });
        });
    });

    describe('Read all method', () => {
        it('should send an array with all the subcategories in the database', (done) => {
            chai.request(app)
            .get('/api/subcategories/')
            .set('Accept', 'application/json')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('array').and.has.lengthOf(1);
                expect(res.body[0]).to.have.property('name', subcategory.name);
                done();
            });
        });
    });

    describe('Read single method', () => {
        it('should send an object with the same properties as the ones of the subcategory with the given id', (done) => {
            chai.request(app)
            .get(`/api/subcategories/${subcategory._id}`)
            .set('Accept', 'application/json')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('name', subcategory.name);

                done();
            });
        });

        it(`should send an easter egg if the given id isn't in the valid format`, (done) => {
            chai.request(app)
            .get('/api/subcategories/fakeID')
            .set('Accept', 'application/json')
            .end((err, res) => {
                expect(res).to.have.status(418);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', `I'm a teapot. Don't ask me to brew coffee.`);
                done();
            });
        });

        it(`should send a 404 status code and an error message if there is no subcategory with the given ID`, (done) => {
            chai.request(app)
            .get('/api/subcategories/507f1f77bcf86cd799439011')
            .set('Accept', 'application/json')
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', 'There was no subcategory with the given ID.');

                done();
            });
        });
    });

    describe('Create', () => {
        it('should send back the newly created subcategory if given the right input', (done) => {
            chai.request(app)
            .post('/api/subcategories/')
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
            .post('/api/subcategories/')
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
        it(`should update the subcategory with the given id`, (done) => {
            input.name = 'SubCatTest'
            chai.request(app)
            .put(`/api/subcategories/${subcategory._id}`)
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
            .put(`/api/subcategories/${subcategory._id}`)
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
            input.name = 'Subcategory';
            chai.request(app)
            .put('/api/subcategories/FakeID')
            .send(input)
            .then(res => {
                expect(res).to.have.status(418);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', `I'm a teapot. Don't ask me to brew coffee.`);
                done();
            });
        });

        it(`should send an error message if the subcategory doesn't exist`, (done) => {
            chai.request(app)
            .put('/api/subcategories/507f1f77bcf86cd799439011')
            .send(input)
            .then(res => {
                expect(res).to.have.status(404);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', 'There was no subcategory with the given ID.');
                done();
            });
        });
    });

    describe('Delete method', () => {
        it('should delete the subcategory with the given id and send a success message', (done) => {
            chai.request(app)
            .del(`/api/subcategories/${subcategory._id}`)
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
            .del('/api/subcategories/fakeID')
            .end((err, res) => {
                expect(res).to.have.status(418);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', `I'm a teapot. Don't ask me to brew coffee.`);
                done();
            });
        });

        it(`should send a 404 status code and error message if the subcategory with the given ID doesn't exist`, (done) => {
            chai.request(app)
            .del('/api/subcategories/507f1f77bcf86cd799439011')
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', `There was no subcategory with the given ID`);
                done();
            });
        });
    });
});