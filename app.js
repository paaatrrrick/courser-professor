//require dotenv
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express = require("express");
const http = require("http");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const Routes = require("./routes");
const cookieParser = require("cookie-parser");


app.use(bodyParser.json(), bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({credentials: true, origin: ["http://localhost:3000", "https://courser-beta.vercel.app", "https://chatcourser.com", "https://biodoc.vercel.app"]}));
app.use("", Routes);

const server = http.createServer(app);


let PORT = process.env.PORT;
if (PORT == null || PORT == "") {
    PORT = 8000;
}

server.listen(PORT, () => {
    return console.log(`✅ We're live: ${PORT}`);
});