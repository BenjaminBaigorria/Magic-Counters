import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import logger from "./src/logger.js";
import dotenv from "dotenv"
import express from "express"
import morgan from "morgan";

import Magic from "./src/routes/cards.js";
import Users from "./src/routes/users.js"
import Decks from "./src/routes/decks.js"

dotenv.config();
const PORT=process.env.PORT


const server=express();
server.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
server.use(bodyParser.json({limit:"50mb"}));
server.use(cookieParser());
const morganFormat = ":method :url :status :response-time ms";
server.use(
    morgan(morganFormat, {
      stream: {
        write: (message) => {
          const logObject = {
            method: message.split(" ")[0],
            url: message.split(" ")[1],
            status: message.split(" ")[2],
            responseTime: message.split(" ")[3],
          };
          logger.info(JSON.stringify(logObject));
        },
      },
    })
  );

//=================ROUTES=====================
server.use("/Magic",Magic);
server.use("/Users",Users);
server.use("/Decks",Decks);



server.listen(PORT,()=>{
    logger.info(`SERVER listen on ${PORT} port`)
});

