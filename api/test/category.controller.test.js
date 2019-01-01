const app = require('../index');
const chai = require('chai');
chai.use(require('chai-http'));
const expect = chai.expect;
const mongoose = require('mongoose');
const config = require('config');
const {Category} = require('../models/category.model');
const {Company} = require('../models/company.model');

let category;
let input;
let company;

describe('Category controller', () => {
    before((done) => {
        mongoose.connect(config.get('mongoConnectionString'), {useNewUrlParser: true, useCreateIndex: true});
        mongoose.connection.once('open', () => {
            //Resets the databse before creating the objects
            mongoose.connection.dropDatabase(() => {
                company = new Company({
                    name: 'TestCo',
                    email: 'testco@test.com',
                    phone: '12345'
                });
                company.save((err, company) => {
                    input = {
                        name: 'Category',
                        companyId: company._id.toString()
                    };
                    category = new Category({
                        name: input.name,
                        company: {
                            _id: company._id,
                            name: company.name
                        }
                    });
                    category.save((err, category) => {
                        done();
                    });
                });
            });
        });
    });

    describe('Read all method', () => {
        it('should send an array with all the categories in the database', (done) => {
            chai.request(app)
            .get('/api/categories/')
            .set('Accept', 'application/json')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('array').and.has.lengthOf(1);
                expect(res.body[0]).to.have.property('name', category.name);
                done();
            });
        });
    });

    describe('Read single method', () => {
        it('should send an object with the same properties as the ones of the category with the given id', (done) => {
            chai.request(app)
            .get(`/api/categories/${category._id}`)
            .set('Accept', 'application/json')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('name', category.name);

                done();
            });
        });

        it(`should send an easter egg if the given id isn't in the valid format`, (done) => {
            chai.request(app)
            .get('/api/categories/fakeID')
            .set('Accept', 'application/json')
            .end((err, res) => {
                expect(res).to.have.status(418);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', `I'm a teapot. Don't ask me to brew coffee.`);
                done();
            });
        });

        it(`should send a 404 status code and an error message if there is no category with the given ID`, (done) => {
            chai.request(app)
            .get('/api/categories/507f1f77bcf86cd799439011')
            .set('Accept', 'application/json')
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', 'There was no category with the given ID.');

                done();
            });
        });
    });

    describe('Create', () => {
        it('should send back the newly created category if given the right input', (done) => {
            chai.request(app)
            .post('/api/categories/')
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
            input.name = 'bla';
            chai.request(app)
            .post('/api/categories/')
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
        it(`should update the category with the given id`, (done) => {
            input.name = 'CategoryTest'
            chai.request(app)
            .put(`/api/categories/${category._id}`)
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
            input.name = 'bla';
            chai.request(app)
            .put(`/api/categories/${category._id}`)
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
            input.name = 'Category';
            chai.request(app)
            .put('/api/categories/FakeID')
            .send(input)
            .then(res => {
                expect(res).to.have.status(418);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', `I'm a teapot. Don't ask me to brew coffee.`);
                done();
            });
        });

        it(`should send an error message if the category doesn't exist`, (done) => {
            chai.request(app)
            .put('/api/categories/507f1f77bcf86cd799439011')
            .send(input)
            .then(res => {
                expect(res).to.have.status(404);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', 'There was no category with the given ID.');
                done();
            });
        });
    });

    describe('Delete method', () => {
        it('should delete the category with the given id and send a success message', (done) => {
            chai.request(app)
            .del(`/api/categories/${category._id}`)
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
            .del('/api/categories/fakeID')
            .end((err, res) => {
                expect(res).to.have.status(418);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', `I'm a teapot. Don't ask me to brew coffee.`);
                done();
            });
        });

        it(`should send a 404 status code and error message if the category with the given ID doesn't exist`, (done) => {
            chai.request(app)
            .del('/api/categories/507f1f77bcf86cd799439011')
            .end((err, res) => {
                expect(res).to.have.status(404);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message', `There was no category with the given ID`);
                done();
            });
        });
    });
});