import mssql from "mssql"
import logger from "./logger.js"
import dotenv from "dotenv"

dotenv.config()

const config={
    server: process.env.DB_SERVER,
    user: process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DATABASE,
    port: parseInt(process.env.DB_PORT),
    options:{
        encrypt:false,
        trustServerCertificate:true
    }
}

const GetConnection = async()=>{
    try {
        return await mssql.connect(config)
    }
    catch (error) {
        logger.info("Conection error:  ",error);
    }
}


export default GetConnection;