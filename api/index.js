//Require third-party modules
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoose = require('mongoose');

//Require api routers
const categories = require('./routes/categories');
/* const companies = require('./routes/companies');
const locations = require('./routes/locations');
const orders = require('./routes/orders');
const products = require('./routes/products');
const subcategories = require('./routes/subcategories');
const suppliers = require('./routes/suppliers');
const templates = require('./routes/templates');
const users = require('./routes/users'); */

//Initialize express app
const app = express();

//Configuration
if(app.get('env') === 'development'){
    app.use(morgan('tiny'));
    console.log('Morgan enabled.');
}

//Configuring Mongoose
mongoose.connect('mongodb://localhost/unify', {useNewUrlParser: true, useCreateIndex: true});

//Configuring Joi validation to include ObjectID validation
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

//Hooking up api routers
app.use('/api/categories', categories);
/* app.use('/api/companies/', companies);
app.use('/api/locations', locations);
app.use('/api/orders', orders);
app.use('/api/products', products);
app.use('/api/subcategories', subcategories);
app.use('/api/suppliers', suppliers);
app.use('/api/templates', templates);
app.use('/api/users', users);
 */

//PORT
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));