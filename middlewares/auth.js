const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        const token = req.header('token');
        if (!token)
            return res
                .status(401)
                .json({
                    message: "Missing Authentication Token!"
                });

        const verified = jwt.verify(token, process.env.JWT_SECRET);

        if (!verified)
            return res
                .status(401)
                .json({
                    message: "Not Authorized!"
                });
        req.tenant = verified.id;
        next();
    } catch (err) {
        res.status(500).json({
            error: err.message
        })
    }
}

module.exports = auth;