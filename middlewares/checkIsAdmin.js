module.exports = async function (req, res, next) {
    if (req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).send('Permission denied.');
    }
}
