// Importing required modules
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import Routes from './routes.js';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();
// Creating an Express application
const app = express();
// Creating an HTTP server
const server = createServer(app);
mongoose.set('strictQuery', true);
//@ts-ignore
mongoose.connect(process.env.MONGO_URI, {
    //@ts-ignore
    useNewUrlParser: true,
    //@ts-ignore
    useUnifiedTopology: true,
});
const db = mongoose.connection;
//@ts-ignore
db.on("error", (message) => {
    console.log(message);
    console.error("Error connecting to database");
});
db.once("open", () => {
    console.log("✅ Database connected");
});
// Using middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({ credentials: true, origin: ['http://localhost:3000', 'https://biodoc.vercel.app'] }));
app.use('', Routes);
// Starting the server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    return console.log(`✅ We're live: ${PORT}`);
});
