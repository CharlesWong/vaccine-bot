const puppeteer = require('puppeteer');

// Main configuration variables
// TODO: Replace the website and search pattern according to your needs.
const urlToCheck = `https://eastsidefire.signetic.com/home`;
const patternNotToSearchFor = 'No Sites available';
const checkingFrequency = 10 * 1000; // ten seconds.

// Slack Integration
// TODO: Replace the API key if you need to use Slack.
const SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX';
const slack = require('slack-notify')(SLACK_WEBHOOK_URL);

// SendGrid Email Integration
// TODO: Replace the API key if you need to use SendGrid.
const SENDGRID_APY_KEY = 'AA.AAAA_AAAAAAAAAAAAA.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(SENDGRID_APY_KEY);
// TODO: Replace the email address if you need to use SendGrid
const emailFrom = 'youremail@example.com';
const emailsToAlert = ['youremail@example.com'];
const fs = require("fs");


const checkingNumberBeforeWorkingOKEmail = 1440 / (checkingFrequency / 60000);   //1 day = 1440 minutes
let requestCounter = 0;
console.log(`Checking... `);
const checkAvailability = (async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(urlToCheck, {waitUntil: 'networkidle2'});
        await page.content();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'screenshot.png' });
        const found = await page.evaluate(((v) => window.find(v)), patternNotToSearchFor);
        await browser.close();

        if (!found) {
            // Slack Alert Notification
            // TODO: Uncomment these lines if you use Slack.
            // console.log(`Sending Slack...`);
            // slack.alert(`<${urlToCheck}/|Change detected in ${urlToCheck}>`, function (err) {
            //     if (err) {
            //         console.log('Slack API error:', err);
            //     } else {
            //         console.log('Message received in slack!');
            //     }
            // });
            
            // Email Alert Notification
            // TODO: Uncomment these lines if you use Email.
            // console.log(`Sending email...`);
            // pathToAttachment = `${__dirname}/screenshot.png`;
            // attachment = fs.readFileSync(pathToAttachment).toString("base64");
            // const msg = {
            //     to: emailsToAlert,
            //     from: emailFrom,
            //     subject: `Vaccine Available ${urlToCheck}`,
            //     html: `Vaccine Available in <a href="${urlToCheck}"> ${urlToCheck} </a>  `,
            //     attachments: [
            //         {
            //          filename: "screenshot.png",
            //          type : "image/png",
            //          content: attachment,
            //          content_id: "myimagecid",
            //          disposition : "inline"
            //         }
            //       ],
            // };
            // sgMail.send(msg)
            //     .then(()=>{console.log("Alert Email Sent!");})
            //     .catch((emailError)=>{console.log(emailError);});
        } else {
            console.log(`No updates...`);
        }
    })

//Main function
const intervalId = setInterval(function () {
    checkAvailability();

    requestCounter++;

    // "Working OK" email notification logic
    if (requestCounter > checkingNumberBeforeWorkingOKEmail) {

        requestCounter = 0;

        const msg = {
            to: emailsToAlert,
            from: emailFrom,
            subject: 'Vaccine Website Monitor is working OK',
            html: `Vaccine Website Monitor is working OK - <b>${new Date().toLocaleString("en-US", {timeZone: "America/New_York"})}</b>`,
        };
        sgMail.send(msg)
            .then(()=>{console.log("Working OK Email Sent!");})
            .catch((emailError)=>{console.log(emailError);});
    }

}, checkingFrequency);
