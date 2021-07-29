const { verify } = require("jsonwebtoken");

const userByToken = (req, res, next) => {
    const accessToken = req.body.accessToken;
    console.log(accessToken);
    if (!accessToken) return res.json({ error: "User is not logged in"});

    try{
        const validToken = verify(accessToken, "authapplication");
        if (validToken){
            req.body = validToken;
            return next();
        }
    } catch(e){
        return res.json({ error: e });
    }
};

module.exports = { userByToken };
