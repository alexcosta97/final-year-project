const config = {
    jwtPrivateKey: "unify_jwtPrivateKey",
    mongoConnectionString: process.env.MONGOURI || "mongodb://localhost/unifyDev"
};

module.exports = config;