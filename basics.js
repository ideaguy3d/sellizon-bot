/*

Puppeteer
Browser
BrowserContext
Page
Frame
Worker

*/

const fs = require('fs');

//---- Script Code ----\\

class classOne {
    constructor(msg, XMLHttpRequest) {
        console.log(msg);
        this.XMLHttpRequest = XMLHttpRequest;
    }

    practiceOne() {
        let v = 'some value';

        console.log('hmm, interesting');

        let debug = 'point';
    }

    async practiceAsync() {
        return 'return from async';
    }

    promiseOne() {
        // resolve and reject are functions
        const promise = new Promise((resolve, reject) => {
            fs.readFile('json/one.json',
                (error, data) => {
                    if (error) {
                        return reject(error);
                    }
                    else {
                        return resolve(data);
                    }
                }
            );
        });

        console.log("\n_> Async req made...\n");

        promise.then((data) => {
            console.log(
                "\n__>> SUCCESS - The Microsoft browser is ",
                JSON.parse(data).someBrowsers.microsoft
            );
            console.log(
                "\n__>> SUCCESS - The Google browser is ",
                JSON.parse(data).someBrowsers.google);
        }, (err) => {
            console.log("\n__>> error, ugh...\n", err.message);
        });
    }
}

function tempAllocadenceSupplier() {
    let alloSuppleirs = [
        "https://app.allocadence.com/v3/admin/suppliers",
        "https://app.allocadence.com/v3/admin/new-supplier",
        "https://app.allocadence.com/v3/admin/edit-supplier/47",
        "https://app.allocadence.com/v3/admin/supplier/catalog/47",
        "https://app.allocadence.com/v3/admin/edit-supplier/48",
        "https://app.allocadence.com/v3/admin/supplier/catalog/48",
        "https://app.allocadence.com/v3/admin/edit-supplier/49",
        "https://app.allocadence.com/v3/admin/supplier/catalog/49",
        "https://app.allocadence.com/v3/admin/edit-supplier/50",
        "https://app.allocadence.com/v3/admin/supplier/catalog/50",
        "https://app.allocadence.com/v3/admin/edit-supplier/51",
        "https://app.allocadence.com/v3/admin/supplier/catalog/51",
        "https://app.allocadence.com/v3/admin/edit-supplier/119",
        "https://app.allocadence.com/v3/admin/supplier/catalog/119",
        "https://app.allocadence.com/v3/admin/edit-supplier/120",
        "https://app.allocadence.com/v3/admin/supplier/catalog/120",
        "https://app.allocadence.com/v3/admin/edit-supplier/121",
        "https://app.allocadence.com/v3/admin/supplier/catalog/121",
        "https://app.allocadence.com/v3/admin/edit-supplier/122",
        "https://app.allocadence.com/v3/admin/supplier/catalog/122",
        "https://app.allocadence.com/v3/admin/edit-supplier/123",
        "https://app.allocadence.com/v3/admin/supplier/catalog/123",
        "https://app.allocadence.com/v3/admin/edit-supplier/124",
        "https://app.allocadence.com/v3/admin/supplier/catalog/124",
        "https://app.allocadence.com/v3/admin/edit-supplier/127",
        "https://app.allocadence.com/v3/admin/supplier/catalog/127",
        "https://app.allocadence.com/v3/admin/edit-supplier/128",
        "https://app.allocadence.com/v3/admin/supplier/catalog/128",
        "https://app.allocadence.com/v3/admin/edit-supplier/129",
        "https://app.allocadence.com/v3/admin/supplier/catalog/129",
        "https://app.allocadence.com/v3/admin/edit-supplier/130",
        "https://app.allocadence.com/v3/admin/supplier/catalog/130",
        "https://app.allocadence.com/v3/admin/edit-supplier/134",
        "https://app.allocadence.com/v3/admin/supplier/catalog/134",
        "https://app.allocadence.com/v3/admin/edit-supplier/139",
        "https://app.allocadence.com/v3/admin/supplier/catalog/139",
        "https://app.allocadence.com/v3/admin/edit-supplier/140",
        "https://app.allocadence.com/v3/admin/supplier/catalog/140",
        "https://app.allocadence.com/v3/admin/edit-supplier/178",
        "https://app.allocadence.com/v3/admin/supplier/catalog/178",
        "https://app.allocadence.com/v3/admin/edit-supplier/181",
        "https://app.allocadence.com/v3/admin/supplier/catalog/181"
    ];
}

function jAsync(XMLHttpRequest) {
    let myClass = new classOne('ello', XMLHttpRequest);

    let [jres] = ['first', '2nd'];

    console.log("\n\n--\n\n");

    myClass.practiceOne();

    console.log("\n\n--\n\n");

    myClass.promiseOne();

    (async function () {
        let jRes = await myClass.practiceAsync();
        console.log(jRes);
    }(myClass));
}

jAsync({dude: 'Not_In_Browser_Bro !! >:/'});


//