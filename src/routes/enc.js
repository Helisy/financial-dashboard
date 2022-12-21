require('dotenv').config();

const bcrypt = require('bcrypt');
const { sign } = require('jsonwebtoken');

const express = require('express');
const router = express.Router();

const database = require('../database');
const db = database();

const { Encrypt, Decrypt } = require('../modules/encrypt');

const { validateToken } = require('../middleware/authMiddleware');



//Redirects to /auth/login

router.get('/en', validateToken, (req, res) => {
    res.render('bank_accounts.ejs', {userName: req.user.firstName});
});

router.post('/en', validateToken, async (req, res) => {
    const {name, uses_credit, credit_limit, closing_day, expiration_day } = req.body;



    let sql = `insert into bank_accounts (name, uses_credit, credit_limit, closing_day, expiration_day, belongs_to_user, date_created_at, date_updated_at) 
    values ('${Encrypt(name)}', 
    '${Encrypt(uses_credit)}', 
    '${Encrypt(credit_limit)}', 
    '${Encrypt(closing_day)}', 
    '${Encrypt(expiration_day)}',
    '${req.user.userId}', 
    '${Encrypt(Date())}', 
    '${Encrypt(Date())}');`;

    db.query(sql, (error, result) => {
        if(error) throw error;
        res.json({message: "Info saved!"});
    });
});

router.get('/de', validateToken, async (req, res) => {
    let sql = `select * from bank_accounts where belongs_to_user = ${req.user.userId};`;

    db.query(sql, (error, result) => {
        if(error) throw error;

        const BankInfos = [];

        result.map(value => {
            const infos = {
                name: Decrypt(value.name),
                uses_credit: Decrypt(value.uses_credit),
                credit_limit: Decrypt(value.credit_limit), 
                closing_day: Decrypt(value.closing_day), 
                expiration_day: Decrypt(value.expiration_day),
                date_created_at: Decrypt(value.date_created_at),
                ate_updated_at: Decrypt(value.date_updated_at)
            };
            BankInfos.push(infos);
        });




        
        console.log(BankInfos);
        res.json(BankInfos);
    });
});

router.get('/entries', validateToken, (req, res) => {
    let sql = `select id, name from bank_accounts where belongs_to_user = ${req.user.userId};`;

    db.query(sql, (error, result) => {
        if(error) throw error;

        const bankInfos = [];
        
        result.map(info => {
            const infos =
            {
                id: info.id,
                name: Decrypt(info.name)
            }
            bankInfos.push(infos);
        });

        res.render('entries.ejs', {userName: req.user.firstName, instName : bankInfos});
    });
    
});

router.get('/entries/ag', validateToken, (req, res) => {
    let sql = `select  entries.*, bank_accounts.name from entries join bank_accounts on entries.institution = bank_accounts.id where entries.belongs_to_user = ${req.user.userId};`;

    db.query(sql, (error, result) => {

        const bankInfos = [];
        
        result.map(info => {
            const infos =
            {
                value: Decrypt(info.value),
                description: Decrypt(info.description),
                transaction_type: Decrypt(info.transaction_type),
                institution: Decrypt(info.name),
                rgs_date: Decrypt(info.rgs_date),
                date_created_at: Decrypt(info.date_created_at),
                date_updated_at: Decrypt(info.date_updated_at)
            }
            bankInfos.push(infos);
        });
        console.log(bankInfos);
        res.json(bankInfos);

    });
    
});

router.post('/entries', validateToken, (req, res) => {
    const {value, description, type, inst, rgs_date} = req.body;
    let sql = `insert into entries (value, description, transaction_type, institution, rgs_date, belongs_to_user, date_created_at, date_updated_at)
    values (
    '${Encrypt(value)}', 
    '${Encrypt(description)}', 
    '${Encrypt(type)}', 
    '${inst}', 
    '${Encrypt(rgs_date)}',
    '${req.user.userId}', 
    '${Encrypt(Date())}', 
    '${Encrypt(Date())}'
    );
    `;

    db.query(sql, (error, result) => {
        if(error) throw error;
        res.json({message: "Info saved!"});
    });
});

module.exports = router;

