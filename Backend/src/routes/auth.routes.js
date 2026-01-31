// implement teh login and register routes
import express from 'express';
import { register, login } from '../controllers/auth.controller.js';

const authRouter = express.Router();

// Route for user registration
authRouter.post('/register', register);

// Route for user login
authRouter.post('/login', login);

export default authRouter;  