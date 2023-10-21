//require dotenv
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express = require("express");
const http = require("http");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Routes = require("./routes");
const cookieParser = require("cookie-parser");
const fileUpload = require('express-fileupload');
const { MongoClient, ServerApiVersion } = require('mongodb');


app.use(bodyParser.json(), bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({credentials: true, origin: ["http://localhost:3000", "https://courser-beta.vercel.app", "https://chatcourser.com"]}));
app.use("", Routes);

const server = http.createServer(app);


let PORT = process.env.PORT;
if (PORT == null || PORT == "") {
    PORT = 8000;
}

server.listen(PORT, () => {
    return console.log(`✅ We're live: ${PORT}`);
});