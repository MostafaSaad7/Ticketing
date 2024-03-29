import express,{Request,response} from 'express';
import 'express-async-errors'
import {json} from 'body-parser';
import cookieSession from 'cookie-session';
import {currentUser} from '@ms-shared-ticketing/common';

// Error Handlers 
import { errorHandler,NotFoundError } from '@ms-shared-ticketing/common';

 

//router 
import {createTicketRouter} from './routes/new';
import {indexTicketRouter} from './routes/index';
import { showTicketRouter } from './routes/show';
import { updateTicketRouter } from './routes/update';




const app = express();

app.set('trust proxy', true);
app.use(json());



app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !=='test'
}));

app.use(currentUser);
app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);


 
app.all('*', async (req, res) => {
    throw new NotFoundError();
});
app.use(errorHandler);

export {app} ;