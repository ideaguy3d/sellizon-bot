const puppeteer = require('puppeteer');
const fs = require('fs');

let fileDownloadInfo = [];

nameSeekerStart(fileDownloadInfo);

/**
 * This function will invoke crawlNameSeeker() in the node file system callback.
 * nameSeekerStart() itself will parse the .txt file and convert it to an array
 *
 * @param fileDownloadInfo array - data that will be filled by the .txt data and passed to crawlNameSeeker()
 */
function nameSeekerStart(fileDownloadInfo) {

    console.log('\n loading .txt data into memory\n');

    // 1st parse the .txt data
    fs.readFile('txt-data/data.txt', 'utf-8', function (err, data) {
        if (err) {
            console.error('\n\n __>> ERROR: \n\n');
            console.error(err);
        }

        let lines = data.split('\r\n');

        console.log('\n split data to ' + lines.length + ' arrays\n');
        console.log('\n parsing txt data...\n');

        let rec;
        let fileInfoModel = {
            file_id: '',
            file_pass: ''
        };

        let fileId;
        let filePass;
        let phraseFileId = 'file id:';
        let phraseFilePass = 'file password:';

        for (let i = 0; i < lines.length; i++) {
            rec = lines[i];

            // sanitize data
            rec = rec.toLowerCase();
            rec = rec.trim();
            rec = rec.replace(/\s+/gi, ' ');

            if (rec.indexOf(phraseFileId) >= 0) {
                fileId = lines[i].substring(rec.indexOf(':'));
                fileId = fileId.trim();
                fileId = fileId.replace(":\t", '');
                fileInfoModel.file_id = fileId;
            }
            else if (rec.indexOf(phraseFilePass) >= 0) {
                filePass = lines[i].substring(rec.indexOf(':'));
                filePass = filePass.trim();
                filePass = filePass.replace(":\t", '');
                fileInfoModel.file_pass = filePass;

                // add file data
                fileDownloadInfo.push(fileInfoModel);
                console.log("\n file download data added = ", fileInfoModel);
                fileInfoModel = {
                    file_id: '',
                    file_pass: ''
                };
            }

        } // END OF: for-loop

        console.log("\n __>> Total files to be download = " + fileDownloadInfo.length + "\n");
        console.log('\n finished parsing .txt data\n');

        crawlNameSeeker(fileDownloadInfo)
    });

} // END OF: parseTxtData()

/**
 * This function will create an instance of puppeteer and launch it and
 * create a new page
 * @param fileDownloadInfo
 */
function crawlNameSeeker(fileDownloadInfo) {

    let nameSeekerLogin = 'https://secure.seekerinc.com/login';

    // get login info
    const info = require('./settings.js');

    // CSS selectors
    let selectLogin = 'input[id="j_username"]';
    let selectPass = 'input[name="j_password"]';
    let selectLoginBtn = 'input[name="submit"][value="Log In"]';
    let selectExternalDownloadsLink = 'a[href="/downloads/external"]';
    let selectFileIdInput = 'input[name="order_id"]';
    let selectFilePassInput = 'input[name="order_pass"]';
    let selectDownloadBtn = 'input[type="submit"][value="Download"][class="link_button"]';
    let selectOrderCheckBox = 'input[id="order_cbk"]';
    let selectFileDownload = 'input[type="submit"][value="Download"][class="link_button"]';
    let selectLogoutLink = 'a[href="/logout"]';


    (async function () {
        // @@GUI
        const browser = await puppeteer.launch({headless: false}); //
        const page = await browser.newPage();
        let file;

        await page.goto(nameSeekerLogin, {waitUntil: 'load'});
        console.log('\n logging user in\n');

        await page.type(selectLogin, info.ns_user);

        console.log('\n typing login\n');

        await page.type(selectPass, info.ns_pass);

        console.log('\n typing password\n');
        console.log('\n clicking login button\n');

        await Promise.all([
            page.waitForNavigation(),
            page.click(selectLoginBtn, {waitUntil: 'load'})
        ]);

        console.log('\n user logged in\n');
        console.log('\n__>> location = ' + page.url());

        await Promise.all([
            page.waitForNavigation(),
            page.click(selectExternalDownloadsLink, {waitUntil: 'load'})
        ]);

        console.log('\n clicked "External Downloads" link\n');

        await page.on('dialog', async dialog => {
            console.log('\n dealing with pop dialog\n');
            dialog.accept();
        });

        // type in file id & pass, submit, download, then repeat for as many files
        // as there are to download
        for (let i = 0; i < fileDownloadInfo.length; i++) {

            file = fileDownloadInfo[i];

            console.log('\n typing file id\n');

            await page.type(selectFileIdInput, file.file_id); // , {waitUntil: 'load'}

            console.log('\n typing file password\n');

            await page.type(selectFilePassInput, file.file_pass); // , {waitUntil: 'load'}

            console.log('\n clicking "download" button\n');

            await Promise.all([
                page.waitForNavigation(),
                page.click(selectDownloadBtn, {waitUntil: 'load'})
            ]);

            console.log('\n__>> location = ' + page.url());
            console.log('\n clicking terms and conditions checkbox\n');

            await page.click(selectOrderCheckBox);

            await page.click(selectFileDownload).then(function () {
                console.log('\n Async callback - clicked download file button\n');
            });

            await Promise.all([
                page.waitForNavigation(),
                page.click(selectExternalDownloadsLink, {waitUntil: 'load'})
            ]);

            console.log('\n Going back to file id & password form\n');

        } // END OF: for-loop, downloading files

        await Promise.all([
            page.waitForNavigation(),
            page.click(selectLogoutLink, {delay: 2000, waitUntil: 'load'})
        ]);

        await browser.close();
    })();
}

// example of how to screen shot a web page
function screenshot() {

    let nameSeeker = 'https://secure.seekerinc.com/login';

    (async function () {
        const browser = await puppeteer.launch({headless: false});

        const page = await browser.newPage();
        await page.goto(nameSeeker, {waitUntil: 'load'});

        console.log(page.url());
        console.log(await page.content());

        await page.screenshot({path: 'screenshot.png'});

        await browser.close();

        console.log('done');
    })();

}

//