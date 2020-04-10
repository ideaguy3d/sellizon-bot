const puppeteer = require('puppeteer');
const fs = require('fs');

getSuppliers();

// get the Allocadence suppliers info
function getSuppliers() {
    let debug; // this will be for debug points
    let info = require('./settings');
    let mostSuppliersPossible = 50;
    let allocadenceLoginPage = 'https://app.allocadence.com/v3/login';
    let userInput = 'input[id*="Username"]';
    let passInput = 'input[id*="Password"';
    let loginBtn = 'button[type="button"]';
    let adminImg = 'img[src*="admin"]';
    let supplierDiv = 'div[style="padding: 8px 0px; z-index: 0;"]>div~div~div~div~div~div~div~div>div>div~div~div';
    let supplierCatalogButtons = 'button[data-for="maintainCatalog"]';
    let supplierAnchors = 'a[href*="supplier"]';
    let btnSideMenu = '#main > div:nth-child(2) > div:nth-child(1) > button';

    let divSupPag = '#main > div:nth-child(3) > div:nth-child(1) > div > div > div:nth-child(2) > div:nth-child(2) ';
    divSupPag += '> div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div';

    // table widget = search input and btn + rendered table results
    let widgetSupplier = '#main > div:nth-child(3) > div:nth-child(1) > div > div > div:nth-child(2)';
    let divPagNext = '> div:nth-child(2) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div > div:nth-child(3)';
    let btnPagNext = `${widgetSupplier + divPagNext} > button`;
    // could use ".getAttribute().contains()" as well
    let blue = 'rgb(103, 177, 226)';
    let btnBluePagNext = `${btnPagNext}[style*="background-color: ${blue}"]`;
    // button[style*="background-color: rgb(103, 177, 226)"]

    /***********************************
     **** Async Programming Starts ****
     **********************************/
    (async function () {
        // Handle "unhandled rejections" that have bubbled up to global scope
        /*window.addEventListener('unhandledrejection', event => {
            // this promise rejection event will have 2 props
            // .promise -- the promise that emitted this rejection event
            // .reason -- the reason this promise was rejected
            event.preventDefault();
            let msg = `an unhandled rejection from ${event.promise} was sent because ${event.reason}`;
            console.log(msg);
            let debug = 'point'; // examine the stack trace
        });*/

        // set timeout wrapper
        // equivalent to: "const wait = secs => new Promise(resolve => setTimeout(resolve, secs))" // too cryptic I think
        const wait = function (secs) {
            return new Promise(resolve => {
                setTimeout(function () {
                    resolve(`${secs} have passed.`)
                }, secs * 1000);
            })
        };

        let myTimer = await wait(2);
        console.log(`my timer = ${myTimer}`);

        /** FIRE UP Puppeteer **/
        const browser = await puppeteer.launch({headless: false}); //, devtools: true
        const page = await browser.newPage();

        // the var the links will be added to
        let catalogButtonInfo;

        // increase viewport size
        await page.setViewport({width: 900, height: 1200});

        // go to allocadence login & type
        await page.goto(allocadenceLoginPage, {waitUntil: 'load'});

        // ___wait...
        await page.waitFor(500);

        // freeze the browser
        //page.evaluate(() => {debugger;});

        console.log(' 1 - above wait for response');

        // _TYPE CLICK SEQUENCE
        await page.type(userInput, info.alloc_user);
        await page.type(passInput, info.alloc_pass);
        await page.click(loginBtn, {delay: 500});

        // _PAGE NAVIGATION
        await page.waitForNavigation({waitUntil: 'load'});

        // ___wait...
        await page.waitFor(4000);

        console.log(' 2 - below the page navigation');

        // _CLICK SEQUENCE get to supplier view, close side menu
        await page.click(adminImg, {delay: 500});
        await page.click(supplierDiv, {delay: 500});
        await page.click(btnSideMenu, {delay: 500});

        /*
        // ___wait...
        await page.waitFor(500);
        //qSelect all supplier links
        catalogButtonInfo = await page.$$(supplierAnchors);
        */

        // ___wait...
        await page.waitFor(500);

        console.log(' 3 - links should be extracted');

        let catalogLinks = [], crawlerHtml, btnBluePagNextNode, elem, c = 0;
        do {
            //qSelect all supplier links
            catalogButtonInfo = await page.$$(supplierAnchors);
            // ___wait...
            await page.waitFor(500);

            /* 1) EXTRACT SUPPLIER LINKS */
            for (let elemHandle of catalogButtonInfo) {
                // This is how to deal with "class ElementHandle", damned frustrating to figure this out.
                // https://pptr.dev/#?product=Puppeteer&version=v2.1.1&show=api-pageevaluatepagefunction-args
                // "link" is a live DOM node, I believe it'll have these props (link.href is specific for <a/> nodes):
                // https://developer.mozilla.org/en-US/docs/Web/API/Node
                crawlerHtml = await page.evaluate(link => link.href, elemHandle);
                await elemHandle.dispose();
                catalogLinks.push(crawlerHtml);
            }

            /* 2) CLICK PAGINATION NEXT BUTTON */
            console.log('_> RS - clicking the pagination next button');
            btnBluePagNextNode = await page.$(btnPagNext);
            elem = await page.evaluate((e) => {
                return {style: e.style, getAttrStyle: e.getAttribute('style')};
            }, btnBluePagNextNode);
            // ___wait...
            await page.waitFor(500);

            c++; // track loop count in case something goes wrong
            if(c === 300) {
                console.log('__>> ERROR, c = ' + c + ', stopping loop.');
                console.log('elem = ', elem);
            }
            // special debug condition for 12:08pm on 3-3-2020
            else if(c === 4) {
                debug = 1;
            }

            // _CLICK pagination next btn
            await page.click(btnPagNext, {delay: 500});
            // ___wait...
            await page.waitFor(500);

        } while (c < 2 || (elem.getAttrStyle.includes(blue) && (c < 300)));

        // ___wait...
        await page.waitFor(500);

        console.log(`\n _> SUCCESS - catalog links have been extracted, there are ${catalogLinks.length}:`);
        console.log(catalogLinks, "\n\n");

        let link, totalSuppliers = 0;
        for (let i = 0; i < catalogLinks.length; i++) {
            link = catalogLinks[i].toString();
            // self perceived: "BLOCK_CHECK"
            if (!link.includes('/catalog/')) continue;
            // go to each supplier view
            await page.goto(link);

            /* TIME TO SCRAPE: [sku, vendor_code, supplier] \^_^/ */
            //TODO: extract [Supplier, Vendor Code, SKU] from each supplier view
            // perhaps use page.content() and use JS Regex to match the needed fields.
            // ... then export the results to txt or csv


            //... done scraping data

            // log something so I know it hasn't hit an infinite loop
            console.log(`${++totalSuppliers} - scanning ${link}`);

            // ___wait...
            await page.waitFor(1000);

            if(totalSuppliers > mostSuppliersPossible) break;
        }

        debug = 1;

        // const [response] = await Promise.all([
        //     page.waitForNavigation({waitUntil: 'load'}),
        //     page.click(loginBtn, {delay: 500})
        // ]);

    }());
}