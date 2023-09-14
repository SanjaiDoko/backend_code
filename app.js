const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();
const path = require("path");
const fs = require("fs");
const app = express();
const server = require("http").createServer(app);
const morgan = require("morgan");
const cors = require("cors");
const socketIo = require("socket.io");

app.options("*", cors());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: [
      "Origin",
      "X-Requested-with",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
  })
);

const io = socketIo(process.env.SOCKETPORT, {
  cors: {
    origin: process.env.UIURL,
  },
});

let users = [];

const addUser = (ticketId, userId, socketId,role) => {
  users = users.filter((user)=> user.userId !== userId)
  users.push({ ticketId, userId, socketId,role });
  
};


const getUser = (receiverId, curentUser) => {
  console.log(curentUser.filter((user) => user.userId === receiverId)),"adasdasdasd";
  return(curentUser.filter((user) => user.userId === receiverId));
};

io.on("connection", (socket) => {

  //get id from the client side
  socket.on("users", (ticketId, userId,role) => {
    addUser(ticketId, userId, socket.id,role);
    io.emit("getUsers", users);
  });

  // send and get message
  socket.on("sendMessage", ({ senderId,senderName,receiverId, text, createdAt }) => {
    for(let i=0; i<receiverId.length;i++){
      const user = getUser(receiverId[i],users);
      io.to(user[0]?.socketId).emit("getMessage", {
        senderId,
        senderName,
        text,
        createdAt
      });
    }
  });

  socket.on("disconnect", () => {
    users = users.filter((user) => user.socketId !== socket.id);
    io.emit("getUsers", users);
  });
});

let options = {
  connectTimeoutMS: 30000,
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
mongoose.connect(process.env.DB_URL, options);
mongoose.connection.on("error", (error) =>
  console.error("Error in MongoDb connection: " + error)
);
mongoose.connection.on("reconnected", () =>
  console.log("Trying to reconnect!")
);
mongoose.connection.on("disconnected", () =>
  console.log("MongoDB disconnected!")
);
mongoose.connection.on("connected", () => {
  /** Middleware Configuration */
  app.set("etag", false);
  app.use(bodyParser.urlencoded({ limit: "100mb", extended: true })); // Parse application/x-www-form-urlencoded
  app.use(bodyParser.json({ limit: "100mb", strict: true })); // bodyParser - Initializing/Configuration

  // app.use(compression()) // use compression middleware to compress and serve the static content
  app.use(
    "/fileuploads",
    express.static(path.join(__dirname, "/fileuploads"), { etag: false })
  );

  var accessLogStream = fs.createWriteStream(
    path.join(__dirname, "access.log"),
    { flags: "a" }
  );

  //setup the logger
  app.use(
    morgan(
      function (tokens, req, res) {
        if (tokens.method(req, res) == "POST") {
          return [
            tokens.method(req, res),
            tokens.url(req, res),
            tokens.status(req, res),
            tokens.res(req, res, "content-length"),
            "-",
            JSON.stringify(req.body),
            "-",
            tokens["response-time"](req, res),
            "ms",
            new Date().toJSON(),
          ].join(" ");
        } else {
          return [
            tokens.method(req, res),
            tokens.url(req, res),
            tokens.status(req, res),
            tokens.res(req, res, "content-length"),
            "-",
            tokens["response-time"](req, res),
            "ms",
            new Date().toJSON(),
          ].join(" ");
        }
      },
      { stream: accessLogStream }
    )
  );

    require("./routes/admin")(app);
    require("./routes/user")(app);
    require("./routes/ticket")(app)
    require("./routes/bookRoom")(app)
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
