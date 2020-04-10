// $ npm i --save puppeteer
const puppeteer = require('puppeteer');
// $ npm i --save chrome-launcher
const chromeLauncher = require('chrome-launcher');
// $ npm i --save chrome-remote-interface
const CDP = require('chrome-remote-interface');
// $ npm i --save-dev selenium-webdriver chromedriver
const fs = require('fs');
const webdriver = require('selenium-webdriver');
const chromedriver = require('chromedriver');

loginToJobBoard();
downLoadAccountantCsv();

/**
 * Invoked from "loginToJobBoard(){}"
 * @param headless
 * @returns {Promise<LaunchedChrome>}
 */
function launchChrome(headless = false) {
    return chromeLauncher.launch({
        chromeFlags: [
            '--window-size=1200,800', '--disable-gpu', headless ? '--headless' : ''
        ]
    });
}

// uses the Chrome Remote Interface module
function loginToJobBoard() {
    (
        async function () {
            const chrome = await launchChrome();
            const protocol = await CDP({port: chrome.port});

            // Extract the DevTools protocol domains we need and enable them.
            // See API docs: https://chromedevtools.github.io/devtools-protocol/
            const {Page, Runtime} = protocol;
            await Promise.all([Page.enable(), Runtime.enable()]);

            Page.navigate({url: 'https://redstonemail.com/users/login'});

            // Wait for window.onload before doing stuff.
            Page.loadEventFired(async () => {
                let loginJulius = require('./settings.js');

                console.log("\n\rpass = " + loginJulius.pass + ", username = " + loginJulius.user + "\n\r");

                const js1 = "document.getElementById('UserUsername').value = '" + loginJulius.user + "'";
                const js2 = "document.getElementById('UserPassword').value = '" + loginJulius.pass + "'"; //
                const js3 = "document.forms[0].submit()";
                const js4 = "document.getElementsByClassName('dropdown-toggle')[6].parentElement.classList = 'btn-group open'";
                const js5 = "document.getElementsByClassName('dropdown-toggle')[6].parentElement.children[1].children[2].children[0].click()";

                const user = await Runtime.evaluate({expression: js1});
                const pass = await Runtime.evaluate({expression: js2});
                const login = await Runtime.evaluate({expression: js3});
                const downLoadCsv = await Runtime.evaluate({expression: js5});

                //searchForJob(Runtime);
                //downLoadAccountantCsv(Runtime);

                var point = 'break';
            });

        }
    )();
}

// uses the Chrome Remote Interface module
function downLoadAccountantCsv(Runtime) {
    (
        async function () {
            const js4 = "document.getElementsByClassName('dropdown-toggle')[6].parentElement.classList = 'btn-group open'";
            // document.getElementsByClassName('dropdown-toggle')[6].parentElement.children[1].children[2].children[0].click
            // document.getElementsByClassName('dropdown-toggle')[6].parentElement.children[1].children[2].children[0].click()
            const js5 = "document.getElementsByClassName('dropdown-toggle')[6].parentElement.children[1].children[2].children[0].click()";

            //const openDownloadMenu = await Runtime.evaluate({expression: js4});
            //const downLoadCsv = await Runtime.evaluate({expression: js5});
            console.log("__>> RSM - hopefully the CSV is downloading");
        }
    )();
}

// uses the Chrome Remote Interface module
function searchForJob(Runtime) {
    (
        async function () {
            const js4 = "document.getElementById('showsearchArea').click()";
            const js5 = "document.getElementById('OrderJobId').value = '62654'";
            const js6 = "document.getElementById('jobsearch').click()";

            const showSearch = await Runtime.evaluate({expression: js4});
            const jobNumber = await Runtime.evaluate({expression: js5});
            const searchJob = await Runtime.evaluate({expression: js6});
        }
    )();
}

// uses the Selenium Webdriver
function useChromeDriver2google() {
    const chromeCapabilities = webdriver.Capabilities.chrome();
    //chromeCapabilities.set('chromeOptions', {args: ['--headless']});
    const driver = new webdriver.Builder()
        .forBrowser('chrome')
        .withCapabilities(chromeCapabilities)
        .build();

    // navigate to google.com, enter a search
    driver.get('https://www.google.com/');
    driver.findElement({name: 'q'}).sendKeys('webdriver');
    driver.findElement({name: 'btnK'}).submit();

    driver.wait(webdriver.until.titleIs('webdriver - Google Search'), 5000);

    // take screenshot of results page, save to disk.
    driver.takeScreenshot().then(base64png => {
        fs.writeFileSync('screenshot.png', new Buffer(base64png, 'base64'));
    });

    //driver.quit();
}

function launchChromeConsoleLog() {
    console.log("\n\r__>> invoking prac2()\n\r");
    launchChrome().then(async chrome => {
        const version = await CDP.Version({port: chrome.port});
        console.log('\n\rUser Agent version = ' + version['User-Agent']);
        console.log(`\n\rChrome debuggable on port: ${chrome.port}`);
    });
}

function prac1() {
    (async () => {
        console.log("in prac1() closure");
        const browser = await puppeteer.launch();
        console.log(await browser.version());
        await browser.close();
    })();
}

function createPdf() {
    (async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(
            'https://redstonemail.com/users/login',
            {waitUntil: 'networkidle2'}
        );

        let p1 = page.$('#UserUserName');
        let p2 = {};
        page.$('.form-control').then(function (res) {
            p2 = res;
            console.log('page 2 = ');
            console.log(p2);
        });

        console.log("page 1 = ");
        console.log(p1);


        await page.pdf({path: 'page.pdf', format: 'A4'});
        await browser.close();
    })();
}


//