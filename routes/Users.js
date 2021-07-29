const express = require('express');
const router = express.Router();
const { Users } = require('../models')
const bcrypt = require("bcryptjs");
const { sign } = require('jsonwebtoken');
const { validateToken } = require("../middlewares/AuthMiddleware");
const { userByToken } = require("../middlewares/UserByTokenMiddleware");

router.get("/", async (req, res) => {
    const listOfUsers = await Users.findAll();
    res.json(listOfUsers);
});

router.get("/auth", validateToken, (req, res) => {
    res.json(req.user);
});

router.put("/logout", userByToken, (req, res) => {
    Users.update( { status: "offline" }, { where: { id: req.body.id } });
    res.json("logged out successfully");
});

router.put("/deleteUsers", (req, res) => {
    Users.destroy({ where: { id: req.body } });
    res.json("deleted successfully");
});

router.put("/blockUsers", (req, res) => {
    Users.update( { status: "offline", isBlocked: true }, { where: { id: req.body } });
    res.json("blocked successfully");
});

router.put("/unblockUsers", (req, res) => {
    Users.update( { isBlocked: false }, { where: { id: req.body } });
    res.json("unblocked successfully");
});

router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    bcrypt.hash(password, 10).then((hash) => {
        Users.create({
            username: username,
            email: email,
            password: hash,
            status: "offline",
            isBlocked: false,
        });

        res.json("registered successfully");
    });
});

router.post("/login", async (req, res) => {
    const { nameOrEmail, password } = req.body;

    let user = await Users.findOne({ where: { username: nameOrEmail} });
    if(!user) {
        user = await Users.findOne({ where: { email: nameOrEmail} });
        if(!user) res.json({ error: "User doesn't exist" });
    };

    if(user.isBlocked){
        res.json({ error: "User is blocked" });
    }
    else{
        bcrypt.compare(password, user.password).then((equal) => {
            if (!equal) res.json({ error: "Wrong password" });
    
            Users.update({ lastLogin: Date.now(), status: "online"}, { where: { id: user.id } });
            const accessToken = sign({ id: user.id, username: user.username}, "authapplication");
            res.json(accessToken);
        });
    }
});

module.exports = router;