import express from "express"
import GetConnection from "../sql.js";
import logger from "../logger.js";

const server=express();

server.get("/GetAllDecks",(req,res)=>{
    try {
        res.status(200).send("ok")
    } catch (error) {
        logger.warn("RIP")
    }
})

export default server;