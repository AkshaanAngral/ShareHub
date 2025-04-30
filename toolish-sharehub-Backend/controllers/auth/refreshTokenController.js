// controllers/auth/refreshTokenController.js
const jwt = require("jsonwebtoken");

const refreshTokenController = async (req, res) => {
    const refreshToken = req.body.token;

    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token is required" });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        const payload = {
            id: decoded.id,
            name: decoded.name,
            email: decoded.email,
            isAdmin: decoded.isAdmin || false,
        };

        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        res.json({ accessToken });
    } catch (error) {
        return res.status(403).json({ message: "Invalid refresh token" });
    }
};

module.exports = refreshTokenController;
