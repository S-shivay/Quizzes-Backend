const express = require('express');
const app = express();
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../schema/user.schema');
const bcrypt = require('bcrypt');

router.get('/',(req,res)=>{
    res.send('login page!')
});

router.post('/register', async (req, res) => {
    
const saltRounds = 10;
    try{
        const { name, email, password } = req.body;
    const userExists = await Admin.findOne({email});
    console.log(userExists);
    
    if (userExists) {
        return res.status(400).send('Email already in use' );
        }
        const salt = bcrypt.genSaltSync(saltRounds);
        const hashedPassword = bcrypt.hashSync(password, salt);
        const admin = new Admin({
            name,
            email,
            password:hashedPassword,
            confirmpassword:hashedPassword
        });
        await admin.save();
        const token = jwt.sign({_id: admin._id}, process.env.TOKEN_SECRET);
        res.json({
            email: admin.email,
            token
        })
    }
    catch(e){
        
        return new Error(e.message);
    }
});

router.post('/login', async (req, res) => {
    try{
        const { email, password } = req.body;
    const userExists = await Admin.findOne({email});
    
    if (!userExists) {
        return res.status(400).send('Email or Password is wrong' );
        }
        const validPass = bcrypt.compareSync(password, userExists.password);
        if (!validPass) {
            return res.status(400).send('Email or Password is wrong' );
            }
        const token = jwt.sign({_id: userExists._id}, process.env.TOKEN_SECRET);
        res.json({
            email: userExists.email,
            token
        })
    }
    catch(e){
        
        return new Error(e.message);
    }
});
router.post('/updatePassword', async (req, res) => {
    try{
        const { email, password, newPassword } = req.body;
        const token = req.headers['authorization'];
    const userExists = await Admin.findOne({email});
    
    if (!userExists) {
        return res.status(400).send('Email or Password is wrong' );
        }
        const validPass = bcrypt.compareSync(password, userExists.password);
        if (!validPass) {
            return res.status(400).send('Email or Password is wrong' );
            }
            const verifiedToken = jwt.verify(token, process.env.TOKEN_SECRET);
            const userId = userExists._id.toString();
            if(verifiedToken._id !== userId){
                return res.status(401).send('Unauthorized' );
            }
            const salt = bcrypt.genSaltSync(saltRounds);
        const hashedPassword = bcrypt.hashSync(newPassword, salt);
        await Admin.findOneAndUpdate({email: userExists.email}, {password: hashedPassword});
        res.json({
            message: 'Password updated successfully'
            })
        }
        catch(e){
            throw new Error(e.message);
        }
    });








module.exports = router;