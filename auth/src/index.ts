import express,{Request,response} from 'express';
import 'express-async-errors'
import {json} from 'body-parser';
import mongoose from 'mongoose';
import cookieSession from 'cookie-session';




//Routes
import {currentUserRouter} from './routes/current-user';
import {signinRouter} from './routes/signin';
import {signoutRouter} from './routes/signout';
import {signupRouter} from './routes/signup';


// Error Handlers 
import { errorHandler } from './middlewares/error-handler';
import { NotFoundError } from './errors/not-found-error';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(cookieSession({
    signed: false,
    secure: true
}));
app.use(signinRouter);
app.use(currentUserRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.all('*', async (req, res) => {
    throw new NotFoundError();
});

app.use(errorHandler);
const start= async()=>{
    try{
     
   await mongoose.connect('mongodb://auth-mongo-srv:27017/auth')
    }
    catch(err){
        console.error(err);
    }
    app.listen(3000, () => {
        console.log('Listening on port 3000!!!');
    });
}

start();