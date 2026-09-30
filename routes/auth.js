const express = require('express');
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');
const { pool } = require('./config/connectToDatabase');

const router = express.Router();

const cookieOptions ={
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameState: 'Strict',
    maxAge : 30 * 24 *60 * 60 *1000 //30 days
}

const generateToken =(id) =>{
    return jwt.sign({id}, process.env.JWT_SECRET,{
        expiresIn: '30d'
    });
}

//Register

router.post('/register', async(req,res)=>{
    const { name, email, password } = req.body ;
    if(!username || !email || !password){
        return res.status(400).json({ message: "Please Provide the required fields "});
    }
     //$1 used as a placeholder
    const userExists = await pool.query('SELECT * FROM user WHERE email =$1',[email]);
  
    if(userExists.rows.length >0 ){
        return res.status(400).json({ message: 'User already exists'});
    }
     const hashPassword = await bcrypt.hash(password , 10);

     const newUser = await pool.query(
        'INSERT INTO users (useername, email, password) VALUES($1,$2, $3 ) RETURNING id, name, email',
         [username , email , hashedPassword ]
     );

     const token = generateToken(newUser.rows[0].id);
     //store the token 
     res.cookie('token',token , cookieOptions);

     return res.status(201).json({ user:newUser.rows[0] });

});


//login

router.post('/login', async (req,res) => {
    const { email , password } = req.body;
    if(!email || !password ){
       return res.status(400).json({ message: 'Please provide the email and password '}); 
    }
    const user = await pool.query('SELECT * FROM users WHERE email = $1',[email]);

    if(user.rows.length ===0 ){
        return res.status(400).json({message: 'Invalid Email or Password'});
    }
    const userData = user.rows[0];

    const isMatch = await bcrypt.compare(password, userData.password);

    if(!isMatch){
        return res.status(400).json({ message: 'Invalid Email or Password'});
    }
    const token = generateToken(userData.id);

    res.cookie('token', token, cookieOption);

    res.json({ user: { id: userData.id, username: userData.username, email: userData.email}
    });
});

router.get('/me',protect, async(req,res)=>{
    res.json(req.user);
    //return the info of logged in user from protect middleware
});

//logout

router.post('/logout' ,(req,res)=>{
    res.cookie('token','',{ ...cookieOptions, maxAge: 1});
    res.json({ message: 'logged out Successfully '});
})

module.exports = router;