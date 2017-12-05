'use strict';
const https = require('https');
const axios = require('axios');
const instance = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});

const USERS = 'users';

function Users () {}

Users.prototype.registerUser = function(data) {
    var tempororyPassword = data['password'];
    var tempororyEmail = data['email'];
    delete data['password'];
    delete data['confirmPassword'];
    if(data['submit']) {
        delete data['submit'];
    }
    return instance.put(`${this.webUrl}/users/${tempororyEmail}?pw=${tempororyPassword}`, data, {
            maxRedirects: 0
        })
        .then((response) => {
            return response.data;
        }).catch(function(err) {
            return err;
        }); //add catch here
}

Users.prototype.getUser = function(data) {
    return instance.get(`${this.webUrl}/users/${data.email}`, {
            'headers': {
                Authorization: `Bearer ${data.authToken}`
            }
        })
        .then(function(response) {
            return response.data;
        }).catch(function(err) {
            return err;
        });
}

Users.prototype.loginUser = function(data) {
    return instance.put(`${this.webUrl}/users/${data.email}/auth`, {
            pw: data.password
        }, {
            maxRedirects: 0
        })
        .then((response) => {
            return response.data;
        }).catch(function(err) {
            return err;
        });
}

module.exports = new Users();