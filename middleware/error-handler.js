require('dotenv').config()
const { StatusCodes } = require('http-status-codes');
const logger = require('../utils/logger');

const errorHandlerMiddleware = (err, req, res, next) => {
    // No exposes for stack traces in production responses
    let customError = {
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        msg: err.message || 'Something went wrong, try again later'
    }

    if ( err.name === 'ValidationError' ) {
        customError.msg = Object.values(err.errors)
        .map((item) => item.message)
        .join(', ')
        customError.statusCode = 400
        err.logLevel = 'error'
    }

    if ( err.name === 'CastError' ){
        customError.msg = `No items with id: ${err.value}`;
        customError.statusCode = 404
        err.logLevel = 'error'
    }

    if ( err.code && err.code === 11000 ) {
        customError.msg = `Duplicate value entered for ${Object.keys(err.keyValue)} field, please choose another value`;
        customError.statusCode = 400;
        err.logLevel = 'error';
    }

    if ( err.name === 'SyntaxError' ) {
        customError.msg = 'Syntax error. Review input for proper structure.';
        customError.statusCode = 400;
        err.logLevel = 'error'
    }

    if (err.logLevel == 'warn' && process.env.LOG_CLIENT_ERRORS == '1'){ // if log level is warn && LOG_CLIENT_ERRORS enabled
        // Warning logger
        logger.warn({
            userId: req?.user?.userId,
            message: err.message,
            stack: err.stack,
            path: req.originalUrl,
            method: req.method,
            ip: req?.ip,
            userAgent: req?.headers['user-agent'],
        })
    } else if(err.logLevel !== 'warn') {
        // Error logger
        logger.error({
            userId: req?.user?.userId,
            message: err.message,
            stack: err.stack,
            path: req.originalUrl,
            method: req.method,
            ip: req?.ip,
            userAgent: req?.headers['user-agent'],
        })
    }

    //return res.status(customError.statusCode).json({ msg: err })
    return res.status(customError.statusCode).json({ msg: customError.msg })
}

module.exports = errorHandlerMiddleware