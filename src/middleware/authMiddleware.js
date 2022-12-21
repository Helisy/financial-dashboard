require('dotenv').config();

const { verify } = require('jsonwebtoken');

const database = require('../database');
const db = database();


//Verifies if the the acessToken in the cookies is valid.
const validateToken = (req, res, next) => {
    const acessToken = req.cookies.acessToken;

    if(!acessToken) return res.redirect('/auth/login');

    verify(acessToken, process.env.TOKEN_SECRETE, (err, user) =>{
        if (err) return res.sendStatus(403);
        req.user = user;
        return next();
    });
}

//Verifies is the user is already logged.
const isAuthenticated = (req, res, next) => {
    const acessToken = req.cookies.acessToken;

    if(!acessToken) return next();

        verify(acessToken, process.env.TOKEN_SECRETE, (err, user) =>{
        if (err) return res.sendStatus(403);
        req.user = user;
        res.redirect('/user');
    });
}

//Verifies if the user has the correct role.
function authRole(role){
    return (req, res, next) => {
        let sqlRole = `SELECT role FROM users WHERE id = '${req.user.userId}'`;
        db.query(sqlRole, (error, result) => {
            if(error) throw error;
            if(role !== result[0].role) return res.sendStatus(401);
            next();
        });
    };
}

module.exports = { validateToken, isAuthenticated, authRole };