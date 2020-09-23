const express = require('express');
const cors = require('cors');
const app = express();

const whitelist = ['http://localhost:3000', 'https://localhost:3443'];

var corsOptionsDelegate = (req, callback) => {
    var corsOptions;
//checking if the incoming req header contain the origin belong to whitelist array
//and allow the access control-allowOrigin
    if(whitelist.indexOf(req.header('Origin')) !== -1){
        corsOptions = {origin: true};
    }else {
        corsOptions = {origin: false};
    }
    callback(null, corsOptions);
}

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);