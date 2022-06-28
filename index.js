const Apify = require('apify');
const { log } = Apify.utils;
const nodemailer = require('nodemailer');
const fs = require('fs-extra');
const { Console } = require('console');;

const output = fs.createWriteStream('./info.log');
const errorOutput = fs.createWriteStream('./error.log');
// custom simple logger
const logger = new Console(output, errorOutput);



const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'garyleefighthz@gmail.com',
      pass: ''
    }
  });
  
const sendMail = async (dateString) => {
    const mailOptions = {
        from: 'garyleefighthz@gmail.com',
        to: 'garyleefight@outlook.com',
        subject: 'Sending Email using Node.js',
        text: `${dateString} is available. https://www.recreation.gov/timed-entry/10086745/ticket/10086746`
    };
      
    await transporter.sendMail(mailOptions).catch((error) => {
       
    });
}

const checkDate = async (page, dateString) => {
    const element = await page.$(`[aria-label="${dateString}"] .rec-calendar-day div strong`);
    const value = await page.evaluate(el => el.textContent, element);

    logger.info((new Date()).toISOString() + '\t' + dateString + ':' + value);
    if (value === 'A') {
        await sendMail(dateString);
        logger.info((new Date()).toISOString() + '\t' + dateString + ':' + "mail sent");
    }
}

const run = async () => {
    const option = {
        launchOptions: {
            headless: true,
            useFingerprints: true,
            fingerprintOptions: {
                fingerprintGeneratorOptions: {
                    browsers: [
                        { name: 'firefox', minVersion: 80 },
                        { name: 'chrome', minVersion: 87 },
                        'safari',
                    ],
                    devices: [
                        'desktop',
                    ],
                    operatingSystems: [
                        'windows',
                    ],
                },
            }
        }
    };

    const browser = await Apify.launchPuppeteer(option);
    const page = await browser.newPage();
    await page.goto('https://www.recreation.gov/timed-entry/10086745/ticket/10086746', {waitUntil: 'networkidle2'});

    // Login
    try {
        await page.click('.SingleDatePickerInput_calendarIcon');

	await checkDate(page, 'Thursday, June 30, 2022');    
        await checkDate(page, 'Friday, July 1, 2022');
        await checkDate(page, 'Saturday, July 2, 2022');
        await checkDate(page, 'Sunday, July 3, 2022');
    } catch (error) {
        logger.error((new Date()).toISOString() + '\t' + error);
    }

   let chromeTmpDataDir = null;

// find chrome user data dir (puppeteer_dev_profile-XXXXX) to delete it after it had been used
let chromeSpawnArgs = browser.process().spawnargs;
for (let i = 0; i < chromeSpawnArgs.length; i++) {
    if (chromeSpawnArgs[i].indexOf("--user-data-dir=") === 0) {
        chromeTmpDataDir = chromeSpawnArgs[i].replace("--user-data-dir=", "");
    }
} 
    await browser.close();
if (chromeTmpDataDir !== null) {
    fs.removeSync(chromeTmpDataDir);
}
    // sleep 1 sec
    await new Promise(resolve => setTimeout(resolve, 30 * 1000));
}


Apify.main(async () => {
    while(true) {
        await run();
    }
    log.error((new Date()).toISOString() + '\t' + 'Unexpected Terminated');
});
