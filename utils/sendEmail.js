const nodemailer = require("nodemailer")

const sendEmail = async(email , subject, text) =>{
  try{
    const transporter = nodemailer.createTransport({
      host : "smtp.gmail.com",
      port : 465 ,
      secure : true ,
    
      auth : {
        user : process.env.GMAIL_USER,
        pass : process.env.GMAIL_PASSWORD
      }
    })
    const info = await transporter.sendMail({
      from : `UnBankd <${process.env.GMAIL_USER}>`,
      to : email,
      subject : subject,
      text : text 
    })
  }
  catch(error){
    console.log("error sending email :" , error)
  }
}

module.exports  = { 
  sendEmail
}
