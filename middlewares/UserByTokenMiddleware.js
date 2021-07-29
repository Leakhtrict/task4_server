const { verify } = require("jsonwebtoken");
const { Users } = require('../models');

const userByToken = async (req, res, next) => {
    const accessToken = req.body.accessToken;
    if (!accessToken) return res.json({ error: "User is not logged in"});

    try{
        const validToken = verify(accessToken, "authapplication");
        const user = await Users.findOne({ where: { id: validToken.id, status: "online" } });
        if (user){
            req.body = validToken;
            return next();
        }
        else{
            return res.json({ error: "User is not logged in" });
        }
    } catch(e){
        return res.json({ error: e });
    }
};

module.exports = { userByToken };
