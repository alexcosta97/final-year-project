const {User} = require('../models/user.model');
const {Location} = require('../models/location.model');
const {Company} = require('../models/company.model');
const chai = require('chai');
chai.use(require('chai-http'));
chai.use(require('chai-jwt'));
const expect = chai.expect;
const mongoose = require('mongoose');
const config = require('config');
const {decoder} = require('../services/tokenAuth');

let user;
let location;
let company;
let token;

describe('Token Authentication', () => {
    before((done) => {
        mongoose.connect(config.get('mongoConnectionString'), {useNewUrlParser: true, useCreateIndex: true});
        mongoose.connection.once('open', () => {
            //Resets the database before creating the new model objects
            mongoose.connection.dropDatabase((err) => {
                user = new User({
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

    it(`should decode the token and send an object with the user's id back`, () => {
        let decoded = decoder(token);
        expect(decoded).to.exist;
        expect(decoded).to.not.be.an('error');
        expect(decoded).to.be.an('object');
        expect(decoded).to.have.property('id', user._id.toString());
    });

    it('should send an error message if the token sent is invalid', () => {
        let error = decoder('fakeToken');
        expect(error).to.exist;
        expect(error).to.be.an('error');
        expect(error).to.have.property('message', 'Invalid Token');
    });
});