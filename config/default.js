const config = {
    jwtPrivateKey: "unify_jwtPrivateKey",
    mongoConnectionString: process.env.MONGODB_URI || "mongodb://localhost/unifyDev"
};

module.exports = config;