const jwt = require('jsonwebtoken');

function verifyUser(req, res, next) {

    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.split('Bearer ')[1] : null;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.userId = decoded.id;
            next();
        } catch (err) {
            res.status(401).json({ message: 'Unauthorized' });
        }
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
}
module.exports = {
    verifyUser
};