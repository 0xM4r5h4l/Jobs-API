require('dotenv').config();
require('express-async-errors');

// extra security packages
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimitMiddleware = require('./middleware/rateLimiter');

// Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json')


const express = require('express');
const connectDB = require('./db/connect');
const app = express();

const authRouter = require('./routes/auth');
const jobsRouter = require('./routes/jobs');

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

const authMiddleware = require('./middleware/authentication');

app.use(express.json());
//app.use(helmet());


app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", 'http://127.0.0.1:3000'],
        scriptSrc: ["'self'", "cdn.jsdelivr.net"], // if you load scripts from a cdn.
      }
    }))


app.use(cors());
app.use(xss());
app.use(rateLimitMiddleware);

// Testing that app running
app.get('/', (req, res) => {
    res.status(200).send('<h1>Jobs API</h1><a href="/api-docs">Documentation</a>')
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/jobs', authMiddleware ,jobsRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(port, () => 
            console.log(`Server is listening on port ${port}...`)
        );
    } catch(error){
        console.log(error);
    }
}

start();
