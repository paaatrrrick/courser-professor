// Importing required modules
import dotenv from 'dotenv';
import express, { Application } from 'express';
import { createServer, Server } from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import Routes from './routes.js';
import cookieParser from 'cookie-parser';

// Loading environment variables
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Creating an Express application
const app: Application = express();

// Creating an HTTP server
const server: Server = createServer(app);

// Using middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({ credentials: true, origin: ['http://localhost:3000', 'https://courser-beta.vercel.app', 'https://chatcourser.com', 'https://biodoc.vercel.app'] }));
app.use('', Routes);

// Starting the server
const PORT: string | number = process.env.PORT || 8000;

server.listen(PORT, () => {
  return console.log(`✅ We're live: ${PORT}`);
});