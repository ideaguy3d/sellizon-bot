const puppeteer = require('puppeteer');
const fs = require('fs');

crawlJobBoard();

/**
 * crawlJobBoard() will search job board for all "usaps" jobs
 *   ... will probably write a new function to search only for a specific job id
 */
function crawlJobBoard() {

    let jbLogin = 'https://redstonemail.com/users/login';
    let info = require('./settings');
    let clientName = 'usaps';

    // selectors
    let login = 'input[id="UserUsername"]';
    let pass = 'input[id="UserPassword"]';
    let inputOrder = 'input[id="OrderName"]';
    let btnLogin = 'input[type="submit"][value="Login"]';
    let btnJobSearch = 'button[id="jobsearch"]';
    let btnShowSearch = 'button[id="showsearchArea"]';
    // job view specific dom nodes
    let jvJobId = 'span[data-val="job_id"]';
    let jvCap = 'label[for="data[Order][notes]"]~div';

    //-- CRAWLER START:
    (async function () {
        // function field initializations
        const browser = await puppeteer.launch({headless: false});
        const page = await browser.newPage();
        const oneSec = 1000;
        let clientData = [];
        // function field declarations
        let clientLinksArray;

        // _ON _RESPONSE - event listener
        page.on('response', function (res) {
            let url = res.url();
            let clientUrl = (url.indexOf(('name=' + clientName)) >= 0);

            if ((url.indexOf('/?') >= 0)) {
                console.log('\n\n__>> a response was picked up, res url = \n\n', url);
                console.log(`__>> client name = ${clientName} client url = ` + clientUrl);
            }

            if (clientUrl) {
                console.log(`\n\n\n\n-----------> client url found: ${clientUrl}\n\n`);
            }
        });

        // increase viewport size
        await page.setViewport({width: 1900, height: 1200});

        // start crawling
        await page.goto(jbLogin, {waitUntil: 'load'});
        await page.type(login, info.user);
        await page.type(pass, info.pass);

        await Promise.all([
            page.waitForNavigation(),
            page.click(btnLogin) // , {waitUntil: 'load'}
        ]);

        await page.click(btnShowSearch, {delay: 500});
        await page.type(inputOrder, clientName);

        console.log(`\n\n\n__>> clicking search button ${btnJobSearch}\n`);

        // click search button
        await page.click(btnJobSearch);

        console.log(`\n__>> search button clicked\n`);

        await page.waitForResponse(function (response) {
            let clientUrl = (response.url().indexOf(('name=' + clientName)) >= 0);
            if (clientUrl) {
                console.log('\n\n__>> ** in response after job search button click\n');
                return true;
            }
        });

        console.log('\n_____________>> below .waitForResponse()\n\n');

        await page.waitForNavigation();

        console.log('\n__>> below waitForNavigation(), will wait for a while to let data load\n\n');

        //await page.waitFor(5 * oneSec);

        clientLinksArray = await page.evaluate(function () {
            console.log('\n __>> inside page.evaluate() \n');

            // records with class 'vendor_list' won't contain <a>
            const records = document.querySelectorAll('table.table tr');
            let record;
            let clientLink;
            let clientLinks = [];
            let clientDataModel = {
                clientId: '', // can get id after anchor link is clicked
                clientAnchorLink: ''
            };

            console.log('\n__>>starting to loop over \n');

            // loop over the data table search results
            for (let i = 0; i < records.length; i++) {
                record = records[i];

                // make sure dom node record does not have a class
                if (record.classList.length === 0) {
                    console.log('current record = ', record);

                    // _HARD CODED because I was manually hover over each dom node with my mouse to
                    // figure this out index 3 is the where the <td/> that holds the wraps the <a/>
                    clientLink = record.children[3].children[0].getAttribute("href");

                    // Can get CLIENT ID after anchor link is clicked.
                    console.log('\n\nclient link = ', clientLink);
                    clientLinks.push({
                        clientAnchorLink: clientLink
                    }); 
                }
            }

            return clientLinks;

        }).catch(function (error) {

            console.log("__>> ERROR in page.evaluate() error = ");
            console.log(error);

        }); // END OF: callback

        console.log('\n\n\n __>> client links array: ', clientLinksArray);

        // OUTER LOOP: _CRAWL each job view for USAPS
        for (let link = 0; link < clientLinksArray.length; link++) {
            let jobView = clientLinksArray[link].clientAnchorLink;
            let jobData;

            console.log(`\n\n __>> Will scrape view: ${jobView} \n\n`);

            if((jobView.indexOf('http') >= 0)) {
                await page.goto(jobView);

                jobData = await page.evaluate(function (idSelector, capSelector) {
                    let info = {
                        jobId: document.querySelector(idSelector).innerText,
                        jobCap: document.querySelector(capSelector).innerText
                    };

                    console.log('__>> evaluating view, info = ', info);

                    return info;

                }, jvJobId, jvCap);

                console.log('\njob data added = \n', jobData);
                clientData.push(jobData);
            }

        }

        console.log('\nAll client data = \n', clientData);

        // await browser.close();
    })();
}