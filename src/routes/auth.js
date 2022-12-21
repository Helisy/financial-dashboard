require('dotenv').config();

const bcrypt = require('bcrypt');
const { sign } = require('jsonwebtoken');

const express = require('express');
const router = express.Router();

const database = require('../database');
const db = database();

const { isAuthenticated } = require('../middleware/authMiddleware');
const { response } = require('express');


//Redirects to /auth/login
router.get('/', isAuthenticated, (req, res) => {
    res.redirect('auth/login');
});

router.get('/register', isAuthenticated, (req, res) => {
    res.render('register.ejs', {message: ""})
});

router.get('/login', isAuthenticated, (req, res) => {
    res.render('login.ejs')
});

//Logs out the user
router.get('/logout', async (req, res) => {
    res.cookie('acessToken', '', {maxAge: 1, httpOnly: true});
    res.redirect('/auth/login');
});

//Register a new user
router.post('/register', (req, res) => {

    const {firstName, lastName, email, password} = req.body;

    var nameFormat = /[!-#%-*,-\/:;?@[-\]_{}\u00A1\u00A7\u00AB\u00B6\u00B7\u00BB\u00BF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4E\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65\u{10100}-\u{10102}\u{1039F}\u{103D0}\u{1056F}\u{10857}\u{1091F}\u{1093F}\u{10A50}-\u{10A58}\u{10A7F}\u{10AF0}-\u{10AF6}\u{10B39}-\u{10B3F}\u{10B99}-\u{10B9C}\u{10F55}-\u{10F59}\u{11047}-\u{1104D}\u{110BB}\u{110BC}\u{110BE}-\u{110C1}\u{11140}-\u{11143}\u{11174}\u{11175}\u{111C5}-\u{111C8}\u{111CD}\u{111DB}\u{111DD}-\u{111DF}\u{11238}-\u{1123D}\u{112A9}\u{1144B}-\u{1144F}\u{1145B}\u{1145D}\u{114C6}\u{115C1}-\u{115D7}\u{11641}-\u{11643}\u{11660}-\u{1166C}\u{1173C}-\u{1173E}\u{1183B}\u{11A3F}-\u{11A46}\u{11A9A}-\u{11A9C}\u{11A9E}-\u{11AA2}\u{11C41}-\u{11C45}\u{11C70}\u{11C71}\u{11EF7}\u{11EF8}\u{12470}-\u{12474}\u{16A6E}\u{16A6F}\u{16AF5}\u{16B37}-\u{16B3B}\u{16B44}\u{16E97}-\u{16E9A}\u{1BC9F}\u{1DA87}-\u{1DA8B}\u{1E95E}\u{1E95F}]/u

    if(nameFormat.test(firstName) === true) return res.render('auth/register.ejs', {message: 'Your fist name and last name must not use these special characters'});
    if(nameFormat.test(lastName) === true) return res.render('auth/register.ejs', {message: 'Your fist name and last name must not use these special characters'});

    if(password.length < 6) return res.render('auth/register.ejs', {message: 'Your password is too short'}); 
    
    let sqlEmail = `SELECT * FROM users WHERE email = '${email}'`;

    db.query(sqlEmail, (error, result) => {
        
        if(!result.length)
        {
            bcrypt.hash(password, 10).then((hash) =>
            {
                let sql = `INSERT INTO users (first_name, last_name, email, password) VALUES('${firstName}', '${lastName}',
                 '${email}', '${hash}');`;
        
                 db.query(sql, (error, result) => {
                    if(error) throw error;
        
                    res.redirect('/auth/login');
                }); 
            });
            return;
        }else{
            res.render('register.ejs', {message: "Email already registed"})
            return;
        }
   });


});

//Logs in the user
router.post('/login', async (req, res) => {
    const {email, password} = req.body;

    let sql = `SELECT * FROM users WHERE email = '${email}'`;

     db.query(sql, (error, result) => {
        if(error) throw error;

        if(!result.length)
        {
            res.json({message: "User doesn't exists."})
            return;
        }else{
            bcrypt.compare(password, result[0]['password']).then((match) =>
            {
                if(!match)
                {
                    res.json({message: "Wrong password."})
                    return;
                }else{
                    const acessToken = sign({
                        firstName: result[0].first_name, 
                        lastName: result[0].last_name,
                        userId: result[0].id  
                    }, process.env.TOKEN_SECRETE);

                    res.cookie('acessToken', acessToken, {httpOnly: true}).json({login:'You logged in'});
                    return;
                }
            });

            return;
        }
    });

  
});

module.exports = router;