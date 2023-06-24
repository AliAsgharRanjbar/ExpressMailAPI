import RECEIVE_HTML_TEMPLATE from './receive-mail-template.js';
import SEND_HTML_TEMPLATE from './send-email-template.js';

// require("dotenv").config();
import 'dotenv/config';

// const express = require("express");
import express from "express";

// const cors = require("cors");
import cors from "cors"

// const nodemailer = require("nodemailer");
import nodemailer from "nodemailer"

const router = express.Router();
const port = process.env.PORT || "5000"

// server used to send send emails
const app = express();

app.use(cors()); // FOR DEV

// app.use(cors({ origin: process.env.REMOTE_CLIENT_APP, credentials: true}))  FOR PRODUCTION
app.use(express.json());
app.use("/", router);
app.listen(port, () => console.log(`Server Running on port ${port} ...`)); // FOR DEV

// app.listen() FOR PRODUCTION

const send_email_user = process.env.SEND_EMAIL_USER
const send_email_password = process.env.SEND_EMAIL_PASSWORD
const send_host = process.env.SEND_HOST

const receive_email_user = process.env.RECEIVE_EMAIL_USER
const receive_email_password = process.env.RECEIVE_EMAIL_PASSWORD
const receive_host = process.env.RECEIVE_HOST


router.get("/",(req, res) => {
    res.send("Hello World!")
} )


const contactEmailReceive = nodemailer.createTransport({
  host: receive_host,
  port: 465,
  secure: true,
  auth: {
    user: receive_email_user,
    pass: receive_email_password,
  },
});

const contactEmailSend = nodemailer.createTransport({
  service: send_host,
  auth: {
    user: send_email_user,
    pass: send_email_password,
  },
});

contactEmailReceive.verify((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Ready to Receive");
  }
});


contactEmailSend.verify((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Ready to Send");
  }
});

router.post("/contact", (req, res) => {
  const name = req.body.firstName + " " + req.body.lastName;
  const email = req.body.email;
  const message = req.body.message;
  const phone = req.body.phone;

  const mailReceive = {
    from: name,
    to: "me@alibot.ir",
    subject: "alibot.ir - Contact Form Submission",
    html: RECEIVE_HTML_TEMPLATE(name, email, message, phone),
  };

  contactEmailReceive.sendMail(mailReceive, (error) => {
    if (error) {
      res.json(error);
      console.log("Error While Receiving Email")
    } else {
      res.json({ code: 200, status: "Message Received" });
      console.log("Success! Received email.")
    }
  });


  const mailSend = {
    from: "AliAsghar Ranjbar @ alibot.ir",
    to: email,
    subject: `Dear ${name}! I just received your alibot.ir - Contact Form Submission`,
    html: SEND_HTML_TEMPLATE(name, message),
  };

  contactEmailSend.sendMail(mailSend, (error) => {
    if (error) {
      res.json(error);
      console.log("Error While Sending Email")
    } else {
      res.json({ code: 200, status: "Message Sent" });
      console.log("Success! Sent email.")
    }
  });

});