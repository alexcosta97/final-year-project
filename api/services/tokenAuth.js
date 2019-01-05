const config = require('config');
const jwt = require('jsonwebtoken');

exports.authMiddleware = (req, res, next) => {
    const token = req.header('x-auth-token');
    if(!token) return res.status(401).json({message: 'Access denied. No token provided.'});

    const decoded = decoder(token);
    if(!(decoded instanceof Error)){
        req.user = decoded;
        next()
    } else return res.status(400).json({message: decoded.message});
};

const decoder = (token) => {
    try{
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
        return decoded;
    } catch(err){
        return new Error('Invalid Token');
    }
};

exports.decoder = decoder;