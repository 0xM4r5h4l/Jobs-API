require('dotenv').config()
const rateLimiter = require('express-rate-limit');
const securityLogger = require('../utils/securityLogger');
const {TooManyRequestsError} = require('../errors');

const rateLimitMiddleware = rateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: process.env.RATE_LIMIT_MAX_REQUESTS, // limit each IP to number of requests per windowsMs
        message: 'Too many requests, please try again later',
        handler: (req, res) => {
            securityLogger.warn('RATE_LIMIT_BREACHED', {
                "details": {
                    userId: req?.user?.userId,
                    ip: req?.ip,
                    path: req?.originalUrl,
                    method: req.method,
                    userAgent: req?.headers['user-agent'],
                    limit: req.rateLimit.limit
                }
            });
            
            const error = new TooManyRequestsError('Too many requests from this IP');
            res.status(error.statusCode).json({
                error: error.message
            })
        }
})

module.exports = rateLimitMiddleware