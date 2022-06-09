const Apify = require('apify');
const { log } = Apify.utils;
const nodemailer = require('nodemailer');

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
        console.log(error);
    });
}

const checkDate = async (page, dateString) => {
    const element = await page.$(`[aria-label="${dateString}"] .rec-calendar-day div strong`);
    const value = await page.evaluate(el => el.textContent, element);

    console.log(value);
    if (value === 'A') {
        await sendMail(dateString);
    }
}


Apify.main(async () => {
    // Get the username and password inputs
    const input = await Apify.getValue('INPUT');

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
    await page.goto('https://www.recreation.gov/timed-entry/10086745/ticket/10086746');

    // Login
    await page.click('.SingleDatePickerInput_calendarIcon');

    await checkDate(page, 'Friday, July 1, 2022');
    await checkDate(page, 'Saturday, July 2, 2022');
    await checkDate(page, 'Sunday, July 3, 2022');
    
    await browser.close();

    log.info('Done.');
});