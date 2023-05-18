var nodemailer = require('nodemailer');


exports.sendEmail = async function(args) {
    const {
        email,
        description,
        title,
        reset_token,
        service,
        type
    } = args

    let from = "bow449601@gmail.com";
    let password = "jwymboimqbsnnwtq";
    
    var transporter = nodemailer.createTransport({
        service: service,
        auth: {
        user: from,
        pass: password,
        },
        from: from,
        secureConnection: false,
        port: 587,
        tls: {
            ciphers: "SSLv3",
            rejectUnauthorized: false,
        },
    });
        
        var mailOptions = {
        from: from,
        to: email,
        subject: type == "forget" ? "Forget Password" : "Signup Otp Verification",
        text: type == "forget" ? `Hello: You are receiving this email because we recieved a password reset request for your account\n\n 
            Reset Password Token: ${ reset_token }` : `${ reset_token } is your Boss of the world verification code`
        };
        
        transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
        });
}