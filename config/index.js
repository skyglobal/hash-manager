var findup = require('findup-sync');
var bowerPath = findup('bower.json');
var bower = (bowerPath) ? require(bowerPath) : {};
bower.release = false;

module.exports = {
    bower: bower,
    aws:{
        release: false,
        bucket: process.env.YOUR_AWS_BUCKET,
        key: process.env.YOUR_AWS_ACCESS_KEY_ID,
        secret: process.env.YOUR_AWS_SECRET_ACCESS_KEY,
        region: process.env.YOUR_AWS_REGION
    }
};