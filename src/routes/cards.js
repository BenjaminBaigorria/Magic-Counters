import express from "express";
import axios from "axios";
import logger from "../logger.js";
import GetConnection from "../sql.js";
import mtg from "mtgsdk";
import fs from "fs"
import pars from 'stream-json';


const server=express()
server.use(express.json());

const {parser}=pars;
//=======================================================================================================================================================

server.get("/cards",(req,res)=>{
    axios.get("https://api.magicthegathering.io/v1/cards").then((response)=>{
        logger.info("Getting cards v1 ");
        res.status(200).send(response.data);
    })
})

server.get("/cards-v2",async(req,res)=>{

  const readStream = fs.createReadStream("./all-cards.json").pipe(parser()).pipe(streamArray());
  readStream.on("data",({value})=>{
    console.log(value)
  })
  readStream.on("end",()=>{
    console.log("process succeed")
  })
  readStream.on("error",(err)=>{
    console.log(err)
  })

})


server.get("/getCards/:subtipo/:pageNumber", async(req,res)=>{
  var data=[]
  const {supertypes,colors,name,types,set,gameformat}=req.body;
  const {subtipo,pageNumber}=req.params;
  const result = await mtg.card.where({
    name:name,
    page:pageNumber,
    pageSize: 100, 
    subtypes:subtipo,
    supertypes:supertypes,
    colors:colors, //solo 1 letra por color
    types:types,//enchantment, sorcery,creature, etc
    set:set,//setcode
    gameFormat:gameformat//commander,standar,etc
  });
  data=result.map((obj)=>{
    return {
      name:obj.name,
      Id:obj.id,
      colors: obj.colors,
      type: obj.type,
      types: obj.types,
      subtypes: obj.subtypes,
      rarity: obj.rarity,
      set: obj.set,
      setName: obj.setName,
      text: obj.text,
      artist: obj.artist,
      power: obj.power,
      toughness: obj.toughness,
      imageUrl: obj.imageUrl
    }
  })
  res.send(data);
})


export default server;