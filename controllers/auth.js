require('dotenv').config()
const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError, ForbiddenError } = require('../errors')
const securityLogger = require('../utils/securityLogger');


const register = async (req, res) => {
    const user = await User.create({ ...req.body })
    const token = user.createJWT(req?.ip, req?.headers['user-agent'])

    // Security Logs
    securityLogger.info('USER_REGISTRATION_SUCCESS', {
        userId: this._id,
        userAgent: req?.headers['user-agent'],
        ip: req?.ip
    })
    
    res.status(StatusCodes.CREATED).json({ user: { name: user.name }, token })
}

const login = async (req, res) => {
    const {email, password} = req.body;
    const invalidCredsMssg = "Wrong email/password, access denied";

    if (!email || !password) {
        throw new BadRequestError('You need to provide both email and password');
    }

    const user = await User.findOne({ email })
    if (!user) {
        throw new UnauthenticatedError(invalidCredsMssg);
    }
 
    accountLocked = await user.loginAttempt(req?.ip, req?.headers['user-agent']);
    if (accountLocked){
        throw new ForbiddenError(`Your account has been locked for ${process.env.ACCOUNT_LOCK_DURATION_MINUTES}m`);
    }

    const isPasswordCorrect = await user.comparePasswords(password);
    if (!isPasswordCorrect){
        throw new UnauthenticatedError(invalidCredsMssg);
    }

    const token = user.createJWT(req?.ip, req?.headers['user-agent']);
    await user.resetLoginAttempts(req?.ip, req?.headers['user-agent']); // Resets login attempts counter
    res.status(StatusCodes.OK).json({user: {name: user.name}, token: token})
}

module.exports = {register, login}