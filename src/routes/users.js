import express from "express";
import logger from "../logger.js";
import morgan from "morgan";
import GetConnection from "../sql.js";
import bcrypt from "bcrypt"
import { sendEmail } from "../functions/Email/index.js";
import handlebars from "handlebars";
import fs from "fs"
import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser";

const server = express();


server.get("/get_users", async (req, res) => {
  const pool = await GetConnection();
  const result = await pool.request().query("select * from usuario;");
  res.status(200).json(result.recordset);
})

server.post("/signup", async (req, res) => {
  try {
    const { username, password, mail } = req.body;
    const hash = await bcrypt.hash(password, 12);
    const pool = await GetConnection();
    const theUserExist = await pool.request().query(`SELECT username,mail FROM usuario WHERE username ='${username}' OR mail = '${mail}'`)
    if (theUserExist.recordset.length == 0) {
      await pool.request().query(
        `insert into usuario (username,password,mail) values('${username}','${hash}','${mail}')`
      )
      const source = fs.readFileSync("src/functions/Email/html_template_emailConfirmation.html", "utf-8").toString();
      const template = handlebars.compile(source);
      console.log(process.env.HOST_APP)
      const replacements = {
        username: username,
        redirectTo: process.env.HOST_APP + `/Users/email/confirm/${username}` /// <<<<<---cambiar en deploytment
      }
      const mailed = await sendEmail(template(replacements),mail);
      res.status(200).send(mailed)
    } else {
      res.status(400).send({
        isValid: false,
        error: "Ya existe un usuario con ese username o email"
      })
      return
    }
  } catch (error) {
    logger.info("ERROR /signup: ", error);
    res.send({
      Error: error
    })
    return
  }
})

server.post("/login", async (req, res) => {
  try {
    const { password, username } = req.body
    const pool = await GetConnection();
    const user = await pool.request().query(`select * from usuario WHERE username = '${username}'`)
    if (user.recordset.length == 0) {
      res.send("no user")
      return
    }
    const isValid = await bcrypt.compare(password, user.recordset[0].password)
    if (!isValid) {
      res.send({
        error: "Wrong password",
        isValid: false
      })
      return
    }
    const TOKEN=jwt.sign({id:user.recordset[0].user_id, username:username},process.env.SECRET_KEY,{
      expiresIn: "1h"
    })
    res.cookie("access_token",TOKEN,{
      httpOnly:  true,
      sameSite: "strict",
      maxAge: 1000*60*60 //1 hora
    }).send({
      isValid: true,
      token:TOKEN
    })
  } catch (error) {
    logger.info("Error:", error)
  }
})

server.use((req,res,next)=>{ //protected routes below
  const token=req.cookies.access_token
  req.session={user:null}
  try {
    const data = jwt.verify(token,process.env.SECRET_KEY)
    req.session.user=data
  } catch (error) {
    req.session.user=null
  }
  next()
})

server.get("/email/:username", async (req, res) => {
  const { username } = req.params
  try {
    const source = await fs.readFileSync("functions/Email/htmlTemplates.html", "utf-8").toString();
    const template = handlebars.compile(source);
    const replacements = {
      username: username,
      redirectTo: process.env.HOST_APP + `/Users/email/confirm/${username}` /// <<<<<--------------------------------------------------cambiar en deploytment
    }
    const mailed = await sendEmail(template(replacements));
    res.status(200).send(mailed)

  } catch (error) {
    console.log(error)
    res.send({ Error: error })
  }
})

server.get("/email/confirm/:username", async (req, res) => {
  req.session
  try {
    const { username } = req.params
    const pool = await GetConnection();
    const theUserExist = await pool.request().query(`SELECT username,mail FROM usuario WHERE username ='${username}'`)
    if (theUserExist.recordset.length == 0) {
      res.send("no user")
      return
    }
    else {
      const replacements = {
        username: username, //<<<<--------------------<<<<< change
      }
      const source = await fs.readFileSync("src/functions/Email/EmailConfirmed.html").toString();
      await pool.request().query(`UPDATE usuario SET mailConfirmed = 1 WHERE username = '${username}'`)
      const template = handlebars.compile(source);
      res.status(200).send(template(replacements))
    }
  } catch (error) {
    res.status(400).send("Error, no se pudo confirmar el mail")
  }

})
/* tested
server.get("/protected",(req,res)=>{
  console.log(token)
  if(!token){
    return res.status(403).send("Access denied")
  }
  try {
    const data = jwt.verify(token,process.env.SECRET_KEY)
  } catch (error) {
    
  }
})
*/
export default server;