require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const securityLogger = require('../utils/securityLogger');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide name'],
        minlength: 3,
        maxlength: 50,
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please provide valid email',
        ],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date,
    }
})


UserSchema.pre('save', async function(next){
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

UserSchema.methods.loginAttempt = async function(reqIp, reqUserAgent) {
    /*
        Account Status:
            Attempt registered: 0
            Locked: 1
    */

    if (this.lockUntil && this.lockUntil > Date.now()) {
        // Log repeated on a locked account
        securityLogger.warn('ACCOUNT_LOCKED_ACCESS_ATTEMPT', {
            userId: this._id,
            ip: reqIp,
            userAgent: reqUserAgent,
        })
        return 1;
    }

    this.loginAttempts +=1
    if (this.loginAttempts >= process.env.ACCOUNT_LOCK_THRESHOLD) {
        this.lockUntil = Date.now() + process.env.ACCOUNT_LOCK_DURATION_MINUTES * 60 * 1000;
        // Security Logs
        securityLogger.warn('ACCOUNT_LOCKED', {
            userId: this._id,
            userAgent: reqUserAgent,
            lockDurationMinutes: parseInt(process.env.ACCOUNT_LOCK_DURATION_MINUTES, 10),
            lockUntil: new Date(this.lockUntil).toISOString(),
            attempts: this.loginAttempts,
            ip: reqIp
        })
        this.loginAttempts = 0;
        await this.save();
        return 1;
    }

    await this.save();
    return 0;
}

UserSchema.methods.resetLoginAttempts = async function(){
    if (this.loginAttempts && this.loginAttempts > 0) {
        this.loginAttempts = 0;
        await this.save();
    }
}

UserSchema.methods.createJWT = function (reqIp, reqUserAgent) {
    // Security Logs
    securityLogger.info('LOGIN_SUCCESS_JWT_CREATED', {
        userId: this._id,
        userAgent: reqUserAgent,
        ip: reqIp
    })
    
    return jwt.sign({
        userId: this._id,
        name: this.name
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_LIFETIME,
    })
}

UserSchema.methods.comparePasswords = async function (reqPassword) {
    const isMatch = await bcrypt.compare(reqPassword, this.password)
    return isMatch
}

module.exports = mongoose.model('User', UserSchema)