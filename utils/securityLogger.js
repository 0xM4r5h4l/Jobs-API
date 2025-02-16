const winston = require('winston');

const securityLogger = winston.createLogger({
    level: 'info', 
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: './logs/security.log' })
    ]
});

module.exports = securityLogger;