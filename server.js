const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const knex = require('knex');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
const database = knex({
    client:'mysql',
    connection: {
        host: 'us-cdbr-iron-east-01.cleardb.net',
        user: 'b9ffd1ac7a5ac2',
        password: 'ae7bd7e7',
        database: 'heroku_31114c71b0c2257'
    }
})

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.get('/', (req,res) =>{
    database.select('*').from('top_products')
        .then(products =>{
            res.json(products)
        }).catch(err => res.json('Could not get data.'))
})

app.listen(process.env.PORT || 3000, () => {
    console.log('app is running on port ' + process.env.PORT);
})

app.post('/signin', (req, res) => {
    database.select('*').from('customer')
        .where('customerID','=', req.body.customerID)
        .then(data => {
            return database.select('*').from('customer')
                .where('Fname', '=', req.body.Fname, 'and', 'Lname', '=', req.body.Lname)
                .then(user =>{
                    console.log(user)
                    res.json(user[0])
                })
                .catch(err => res.status(400).json('Unable to get user'))
        })
        .catch(err => res.status(400).json('Wrong Credentials'))
})

app.post('/register-page', (req, res) =>{
    const {Fname, Lname, caddress, ccity, cstate, czip} = req.body;
    database('customer')
        .insert({
        "Fname": Fname,
        "Lname": Lname,
        "caddress": caddress,
        "ccity": ccity,
        "cstate": cstate,
        "czip": czip
    })
        .then(user => {
            res.json(user[0]);
        })
        .catch(err => res.status(400).json('Unable to register.'))
})

app.get('/profile/:customerID', (req, res) => {
    const { customerID } = req.params;
    database.select('*').from('customer').where({customerID})
        .then(user => {
            if(user.length)
                res.json(user[0])
            else
                res.status(400).json('No user found')
        })
})

app.get('/products', (req,res) =>{
    database.select('*').from('products_rated')
        .then(products =>{
            res.json(products)
        })
})

app.get('/products/:UPC', (req,res) =>{
    const {UPC} = req.params;
    database.select('*').from('products_rated').where({UPC})
        .then(product =>{
            if(product.length)
                res.json(product[0])
            else
                res.status(400).json('Could not get product')
        })
})
/*
    /landing  GET = top 5 rated products
    /login POST = success/fail
    /register
    /products GET = all products
    /item GET = all info for specific product
    /order POST = all items in cart as order
 */