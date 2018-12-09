//Require third-party modules
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');

//Require api routers

//Initialize express app
const app = express();

//Configuration
if(app.get('env') === 'development'){
    app.use(morgan('tiny'));
    console.log('Morgan enabled.');
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

//Hooking up api routers


//PORT
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
