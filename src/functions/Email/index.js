import nodemailer from "nodemailer"




const sendEmail= (htmlToSend,email)=>{
    const emailOptions={
        from: "magiccounters@gmail.com",
        to: email,
        subject: "Confirm Email",
        html: htmlToSend
    }

    return new Promise((resolve,reject)=>{
        const transporter= nodemailer.createTransport({
            service:"gmail",
            auth:{
                user: "magiccounters@gmail.com",
                pass: process.env.APP_PASSWORD
            }
        })
        transporter.sendMail(emailOptions,(err,info)=>{
            if(err){
                console.log({ERROR:err});
                resolve(false)
            }
            else{
                console.log("email sent "+info.response )
                resolve(info.response);
            }
        })
    })
}

export {sendEmail};