const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
require("dotenv").config()
const app = express()
const server = require('http').createServer(app)

let options = {
    connectTimeoutMS: 30000,
    useNewUrlParser: true,
    useUnifiedTopology: true,
}
mongoose.connect(process.env.DB_URL, options);
mongoose.connection.on("error", (error) => console.error("Error in MongoDb connection: " + error));
mongoose.connection.on("reconnected", () => console.log("Trying to reconnect!"));
mongoose.connection.on("disconnected", () => console.log("MongoDB disconnected!"));
mongoose.connection.on("connected", () => {
    /** Middleware Configuration */
    app.set("etag", false)
    app.use(bodyParser.urlencoded({ limit: "100mb", extended: true })) // Parse application/x-www-form-urlencoded
    app.use(bodyParser.json({ limit: "100mb", strict: true })) // bodyParser - Initializing/Configuration
    app.use(function(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Access-Control-Allow-Credentials', true);
        next();
    });
    app.use((err, req, res, next) => {
        if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {

            res.send({ response: "invalid JSON input" }) // Handling JSON parsing error
        } else {

            next(err); // Forwarding other errors to the next middleware
        }
    });
    // app.use(compression()) // use compression middleware to compress and serve the static content
    // app.use("/fileuploads", express.static(path.join(__dirname, "/fileuploads"), { etag: false }))

    // var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

    // setup the logger
    // app.use(morgan(
    //     function (tokens, req, res) {

    //         if (tokens.method(req, res) == 'POST') {
    //             return [
    //                 tokens.method(req, res),
    //                 tokens.url(req, res),
    //                 tokens.status(req, res),
    //                 tokens.res(req, res, 'content-length'), '-',
    //                 JSON.stringify(req.body), '-',
    //                 tokens['response-time'](req, res), 'ms',
    //                 new Date().toJSON()
    //             ].join(' ')
    //         }
    //         else {
    //             return [
    //                 tokens.method(req, res),
    //                 tokens.url(req, res),
    //                 tokens.status(req, res),
    //                 tokens.res(req, res, 'content-length'), '-',
    //                 tokens['response-time'](req, res), 'ms',
    //                 new Date().toJSON()
    //             ].join(' ')
    //         }

    //     }, { stream: accessLogStream }));

    require("./routes/admin")(app);
    require("./routes/user")(app);
    /** HTTP Server Instance */
    try {
        server.listen(process.env.PORT, () => {
            console.log("Server turned on with", process.env.ENV, "mode on port", process.env.PORT);
        });
    } catch (ex) {
        console.log("TCL: ex", ex)
    }
    /** /HTTP Server Instance */
});