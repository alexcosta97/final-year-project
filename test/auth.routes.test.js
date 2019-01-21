const app = require('../index');
const chai = require('chai');
chai.use(require('chai-http'));
chai.use(require('chai-jwt'));
const expect = chai.expect;
const mongoose = require('mongoose');
const config = require('config');
const {User} = require('../models/user.model');

let user;
let input;
let token;

describe('Auth Route', () => {
    before((done) => {
        mongoose.connect(config.get('mongoConnectionString'), {useNewUrlParser: true, useCreateIndex: true});
        mongoose.connection.once('open', () => {
            mongoose.connection.dropDatabase(() => {
                user = new User({
                    email: 'user@testco.com',
                    password: 'Password',
                    firstName: 'Test',
                    lastName: 'User',
                    company: {
                        name: 'TestCo'
                    },
                    locations: [
                        {
                            name: 'TestLocation'
                        }
                    ]
                });
                input = {
                    email: 'user@testco.com',
                    password: 'Password'
                }
                user.save((err, user) => {
                    token = user.generateAuthToken();
                    done();
                });
            });
        });
    });

    it(`should login the user and send a token if the login information is correct`, (done) => {
        chai.request(app)
        .post('/api/auth')
        .send(input)
        .then(res => {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.have.property('token');
            done();
        });
    });

    it(`should send a 400 code and error message if the input isn't valid`, (done) => {
        input.email = 'mail';
        chai.request(app)
        .post('/api/auth')
        .send(input)
        .then(res => {
            expect(res).to.have.status(400);
            expect(res).to.be.json;
            expect(res.body).to.have.property('message');
            done();
        });
    });

    it(`should send a 400 code an invalid input message if the email or the password aren't corrects`, (done) => {
        input.email = 'notthieemail@testco.com';
        chai.request(app)
        .post('/api/auth')
        .send(input)
        .then(res => {
            expect(res).to.have.status(400);
            expect(res).to.be.json;
            expect(res.body).to.have.property('message', 'Invalid email or password');
            done();
        });
    });
});