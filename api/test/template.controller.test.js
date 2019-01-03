const app = require('../index');
const chai = require('chai');
chai.use(require('chai-http'));
const expect = chai.expect;
const mongoose = require('mongoose');
const config = require('config');
const {Template} = require('../models/template.model');
const {Location} = require('../models/location.model');
const {Subcategory} = require('../models/subcategory.model');

let template;
let input;
let location;
let subcategory;

describe('Template controller', () => {
    before((done) => {
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
                subcategory = new Subcategory({
                    name: 'Subcategory',
                    category: {
                        name: 'Category'
                    },
                    products: [{
                        name: 'Product',
                        supplierName: 'Supplier',
                        supplierReference: 'SUP-1'
                    }]
                });

                location.save((err, location) => {
                    subcategory.save((err, subcategory) => {
                        input = {
                            name:'Template',
                            locations: [
                                location._id.toString()
                            ],
                            subcategories: [
                                subcategory._id.toString()
                            ],
                            orderDays: [
                                Date.now()
                            ]
                        };

                        template = new Template({
                            name: input.name,
                            locations: [
                                {
                                    _id: location._id,
                                    name: location.name
                                }
                            ],
                            subcategories: [{
                                _id: subcategory._id,
                                name: subcategory.name,
                                category: subcategory.category.name
                            }],
                            orderDays: [Date.now()]
                        });
                        template.save((err, template) => {
                            if(err) console.log(err.message);
                            done();
                        });
                    });
                });
            });
        });
    });

    describe('Read all method', () => {
        it('should send an array with all the templates in the database', (done) => {
            chai.request(app)
            .get('/api/templates/')
            .set('Accept', 'application/json')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('array').and.has.lengthOf(1);
                expect(res.body[0]).to.have.property('name', template.name);
                done();
            });
        });
    });

    describe('Read single method', () => {
        it('should send an object with the same properties as the ones of the template with the given id', (done) => {
            chai.request(app)
            .get(`/api/templates/${template._id}`)
            .set('Accept', 'application/json')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('name', template.name);

                done();
            });
        });

        it(`should send an easter egg if the given id isn't in the valid format`, (done) => {
            chai.request(app)
            .get('/api/templates/fakeID')
            .set('Accept', 'application/json')
            .end((err, res) => {
                expect(res).to.have.status(418);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', `I'm a teapot. Don't ask me to brew coffee.`);
                done();
            });
        });

        it(`should send a 404 status code and an error message if there is no template with the given ID`, (done) => {
            chai.request(app)
            .get('/api/template/507f1f77bcf86cd799439011')
            .set('Accept', 'application/json')
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', 'There was no template with the given ID.');

                done();
            });
        });
    });

    describe('Create', () => {
        it('should send back the newly created template if given the right input', (done) => {
            chai.request(app)
            .post('/api/templates/')
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
            .post('/api/templates/')
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
        it(`should update the template with the given id`, (done) => {
            input.name = 'TempTest'
            chai.request(app)
            .put(`/api/templates/${template._id}`)
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
            .put(`/api/templates/${template._id}`)
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
            input.name = 'Template';
            chai.request(app)
            .put('/api/templates/FakeID')
            .send(input)
            .then(res => {
                expect(res).to.have.status(418);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', `I'm a teapot. Don't ask me to brew coffee.`);
                done();
            });
        });

        it(`should send an error message if the template doesn't exist`, (done) => {
            chai.request(app)
            .put('/api/templates/507f1f77bcf86cd799439011')
            .send(input)
            .then(res => {
                expect(res).to.have.status(404);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', 'There was no template with the given ID.');
                done();
            });
        });
    });

    describe('Delete method', () => {
        it('should delete the template with the given id and send a success message', (done) => {
            chai.request(app)
            .del(`/api/templates/${template._id}`)
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
            .del('/api/templates/fakeID')
            .end((err, res) => {
                expect(res).to.have.status(418);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', `I'm a teapot. Don't ask me to brew coffee.`);
                done();
            });
        });

        it(`should send a 404 status code and error message if the template with the given ID doesn't exist`, (done) => {
            chai.request(app)
            .del('/api/templates/507f1f77bcf86cd799439011')
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', `There was no template with the given ID`);
                done();
            });
        });
    });
});