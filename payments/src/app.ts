import express, { Request, response } from 'express';
import 'express-async-errors'
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { currentUser } from '@ms-shared-ticketing/common';

// Error Handlers 
import { errorHandler, NotFoundError } from '@ms-shared-ticketing/common';


// Routes
import { createChargeRouter } from './routes/new';

const app = express();

app.set('trust proxy', true);
app.use(json());



app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
}));

app.use(currentUser);

// Routes
app.use(createChargeRouter);



app.all('*', async (req, res) => {
    throw new NotFoundError();
});
app.use(errorHandler);

export { app };