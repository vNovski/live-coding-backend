const dotenv = require('dotenv');
const path = require('path');
dotenv.config({
    path: path.resolve(__dirname, `../environments/${process.env.NODE_ENV}.env`)
});

export default {
    NODE_ENV : process.env.NODE_ENV || 'development',
    HOST : process.env.HOST || 'localhost',
    PORT : process.env.PORT || 3000
}