const chromeLauncher = require('chrome-launcher');
const CDP = require('chrome-remote-interface');

loginToNameSeeker();

function launchChrome(headless = false) {
    return chromeLauncher.launch({
        chromeFlags: [
            '--window-size=1200,800',
            '--disable-gpu',
            headless ? '--headless' : ''
        ]
    });
}

function loginToNameSeeker() {
    (
        async function () {
            const chrome = await launchChrome();
            const protocol = await CDP({port: chrome.port});
            const {Page, Runtime} = protocol;

            Promise.all([Page.enable(), Runtime.enable()]);

            Page.navigate({url: 'https://secure.seekerinc.com/login'});

            Page.loadEventFired(async () => {
                const login = require('./julius.js');

                console.log("\n\rpass = " + login.ns_pass + ", username = " + login.ns_user + "\n\r");

                // login
                const typeUsername = "document.getElementById('j_username').value = '" + login.ns_user + "'";
                const typePassword = "document.getElementsByName('j_password')[0].value = '" + login.ns_pass + "'";
                const clickSubmit = "document.getElementsByName('submit')[0].click()";

                const clickDownloadLink = "document.getElementsByClassName('nav')[1].children[0].children[0].click()";

                // type file download info
                const typeFileId = "document.getElementsByName('order_id')[0].value = " + login.file_id_1;
                const typeFilePass = "document.getElementsByName('order_pass')[0].value = " + login.file_pass_1;

                //-- accept terms and download
                const clickAcceptTerms = "document.getElementsByName('accept_terms')[0].click()";
                const downLoadFile = "document.getElementsByClassName('link_button')[0].click()";

                //-- type the username
                await Runtime.evaluate({expression: typeUsername});
                //-- type the password
                await Runtime.evaluate({expression: typePassword});
                //-- click the submit btn
                await Runtime.evaluate({expression: clickSubmit});
                //-- click download anchor link
                await Runtime.evaluate({expression: clickDownloadLink});

                //await Runtime.evaluate({expression: typeFileId});
                //await Runtime.evaluate({expression: typeFilePass});

                /**
                 * This is probably what was causing the infinite loop
                 * These elements didn't exist OR the input fields were not filled out so clicking the download
                 * button was causing an error
                 */
                //-- click the accept terms and conditions button
                //await Runtime.evaluate({expression: clickAcceptTerms});
                //-- press the download button
                //await Runtime.evaluate({expression: downLoadFile});

                /* Trying to detect the dialog
                    Page.javascriptDialogOpening().then(function (param) {
                        Page.handleJavaScriptDialog({accept: true});
                        console.log('hi');
                        console.log(param.toString());
                    });
                */

                Page.javascriptDialogOpening(async () => {
                    console.log('__>> this worked :)');
                });
            });

        }
    )();

} // END OF: loginToNameSeeker()


//