//User inputs: these are specific to your protocol, fill out before using the script

//1. your protocol id: use underscore for spaces, avoid special characters. The display name is the one that will show up in the app, this will be parsed as string.
const protocolName = "EMA_HBN_NIMH"

//2. your protocol display name: this will show up in the app and be parsed as a string
const protocolDisplayName = "Healthy Brain Network (NIMH content)"

//2. create your raw github repo URL
const userName = 'hotavocado'
const repoName = 'HBN_EMA_NIMH'
const branchName = 'clone1'

let yourRepoURL = `https://raw.githubusercontent.com/${userName}/${repoName}/${branchName}`

//3. add a description to your protocol
let protocolDescription = "Daily questions about physical and mental health, NIMH content"

/* hard coded activity display object
let activityDisplayObj = {
    "pre_questionnaire": 'Pre Questionnaire',
    "morning_set": 'Morning Question Set',
    "day_set": 'Mid-day Question Set',
    "evening_set": 'Evening Question Set'
};

*/

/* ************ Constants **************************************************** */
const csv = require('fast-csv');
const fs = require('fs');
const shell = require('shelljs');
const camelcase = require('camelcase');
const mkdirp = require('mkdirp');
const HTMLParser =  require ('node-html-parser');

const schemaMap = {
    "Identifier?": "@id",
    "Variable / Field Name": "skos:altLabel",
    "Item Display Name": "skos:prefLabel",
    "Field Note": "schema:description",
    "Section Header": "preamble", // todo: check this
    "Field Label": "question",
    "Field Type": "inputType",
    "Required Field?": "requiredValue",
    "minVal": "schema:minValue",
    "maxVal": "schema:maxValue",
    "Choices, Calculations, OR Slider Labels": "choices",
    "Branching Logic (Show field only if...)": "visibility",
    "multipleChoice": "multipleChoice",
    "responseType": "@type"

};


const inputTypeMap = {
    "calc": "number",
    "checkbox": "radio",
    "descriptive": "static",
    "dropdown": "select",
    "notes": "text"
};

const uiList = ['inputType', 'shuffle'];
const responseList = ['type', 'requiredValue'];
const defaultLanguage = 'en';
const datas = {};

/* **************************************************************************************** */

// Make sure we got a filename on the command line.
if (process.argv.length < 3) {
    console.log('Usage: node ' + process.argv[1] + 'your_data_dic.csv');
    process.exit(1);
}
// Read the file.
let csvPath = process.argv[2];
let readStream = fs.createReadStream(csvPath).setEncoding('utf-8');

let schemaContextUrl = 'https://raw.githubusercontent.com/ReproNim/reproschema/master/contexts/generic';
let order = {};
let visibilityObj = {};
let scoresObj = {};
let blObj = [];
let languages = [];
let variableMap = [];
let protocolVariableMap = [];
let protocolVisibilityObj = {};
let protocolOrder = [];


let options = {
    delimiter: ',',
    headers: true,
    objectMode: true,
    quote: '"',
    escape: '"',
    ignoreEmpty: true
};

// get all field names and instrument name
csv
    .fromStream(readStream, options)
    .on('data', function (data) {
        if (!datas[data['Form Name']]) {
            datas[data['Form Name']] = [];
            // For each form, create directory structure - activities/form_name/items
            shell.mkdir('-p', 'activities/' + data['Form Name'] + '/items');          
        }
        //create directory for protocol
        shell.mkdir('-p', 'protocols/' + protocolName);
        // console.log(62, data);
        datas[data['Form Name']].push(data);
    })

    .on('end', function () {
        //console.log(66, datas);
        Object.keys(datas).forEach( form => {
            let fieldList = datas[form]; // all items of an activity
            createFormContextSchema(form, fieldList); // create context for each activity
            let formContextUrl = `${yourRepoURL}/activities/${form}/${form}_context`;
            scoresObj = {};
            visibilityObj = {};
            variableMap = [];
            //console.log(fieldList[0]['Form Display Name']);
            activityDisplayName = fieldList[0]['Form Display Name'];
            activityDescription = fieldList[0]['Form Note'];
            fieldList.forEach( field => {
                if(languages.length === 0){
                    languages = parseLanguageIsoCodes(field['Field Label']);
                }
                processRow(form, field);
            });
            createFormSchema(form, formContextUrl);
        });
            //create protocol context
            let activityList = Object.keys(datas);
            let protocolContextUrl = `${yourRepoURL}/protocols/${protocolName}/${protocolName}_context`
            createProtocolContext(activityList);
            
            //create protocol schema
            activityList.forEach( activityName => {
            processActivities(activityName);
            })

            createProtocolSchema(protocolName, protocolContextUrl);
        
    });

function createFormContextSchema(form, fieldList) {
    // define context file for each form
    let itemOBj = { "@version": 1.1 };
    let formContext = {};
    itemOBj[form] = `${yourRepoURL}/activities/${form}/items/`;
    fieldList.forEach( field => {
        let field_name = field['Variable / Field Name'];
        // define item_x urls to be inserted in context for the corresponding form
        itemOBj[field_name] = { "@id": `${form}:${field_name}` , "@type": "@id" };
    });
    formContext['@context'] = itemOBj;
    const fc = JSON.stringify(formContext, null, 4);
    fs.writeFile(`activities/${form}/${form}_context`, fc, function(err) {
        if (err)
            console.log(err);
        else console.log(`Context created for form ${form}`);
    });
}

function createProtocolContext(activityList) {
    //create protocol context file
    let activityOBj = { "@version": 1.1,
                    "activity_path": `${yourRepoURL}/activities/`           
    };
    let protocolContext = {};
    activityList.forEach(activity => {
        //let activityName = activity['Form Name'];
        // define item_x urls to be inserted in context for the corresponding form
        activityOBj[activity] = { "@id": `activity_path:${activity}/${activity}_schema` , "@type": "@id" };
    });
    protocolContext['@context'] = activityOBj
    const pc = JSON.stringify(protocolContext, null, 4);
    fs.writeFile(`protocols/${protocolName}/${protocolName}_context`, pc, function(err) {
        if (err)
            console.log(err);
        else console.log(`Protocol context created for ${protocolName}`);
    });
}


function processRow(form, data){
    let rowData = {};
    let ui = {};
    let rspObj = {};
    let choiceList = [];
   

    rowData['@context'] = [schemaContextUrl];
    rowData['@type'] = 'reproschema:Field';

    // map Choices, Calculations, OR Slider Labels column to choices or scoringLogic key
    if (data['Field Type'] === 'calc')
        schemaMap['Choices, Calculations, OR Slider Labels'] = 'scoringLogic';
    else schemaMap['Choices, Calculations, OR Slider Labels'] = 'choices';

    //console.log(110, schemaMap);
    Object.keys(data).forEach(current_key => {

        // get schema key from mapping.json corresponding to current_key
        if (schemaMap.hasOwnProperty(current_key)) {

            // check all ui elements to be nested under 'ui' key of the item
            if (uiList.indexOf(schemaMap[current_key]) > -1) {
                let uiKey = schemaMap[current_key];
                let uiValue = data[current_key];
                if (inputTypeMap.hasOwnProperty(data[current_key])) { // map Field type to supported inputTypes
                    uiValue = inputTypeMap[data[current_key]];
                }
                // add object to ui element of the item
                if (rowData.hasOwnProperty('ui')) {
                    rowData.ui[uiKey] = uiValue; // append to existing ui object
                }
                else { // create new ui object
                    ui[uiKey] = uiValue;
                    rowData['ui'] = ui;
                }
            }

            // parse multipleChoice
            else if (schemaMap[current_key] === 'multipleChoice' && data[current_key] !== '') {

                // split string wrt '|' to get each choice
                let multipleChoiceVal = (data[current_key]) === '1' ? true:false;
              
                // insert 'multiplechoices' key inside responseOptions of the item
                if (rowData.hasOwnProperty('responseOptions')) {
                    rowData.responseOptions[schemaMap[current_key]] = multipleChoiceVal;
                }
                else {
                    rspObj[schemaMap[current_key]] = multipleChoiceVal;
                    rowData['responseOptions'] = rspObj;
                }
            }
          
            //parse minVal
            else if (schemaMap[current_key] === 'schema:minValue' && data[current_key] !== '') {

                // split string wrt '|' to get each choice
                let minValVal = (data[current_key]);
              
                // insert 'multiplechoices' key inside responseOptions of the item
                if (rowData.hasOwnProperty('responseOptions')) {
                    rowData.responseOptions[schemaMap[current_key]] = minValVal;
                }
                else {
                    rspObj[schemaMap[current_key]] = minValVal;
                    rowData['responseOptions'] = rspObj;
                }
            }

            //parse maxVal
            else if (schemaMap[current_key] === 'schema:maxValue' && data[current_key] !== '') {

                // split string wrt '|' to get each choice
                let maxValVal = (data[current_key]);
              
                // insert 'multiplechoices' key inside responseOptions of the item
                if (rowData.hasOwnProperty('responseOptions')) {
                    rowData.responseOptions[schemaMap[current_key]] = maxValVal;
                }
                else {
                    rspObj[schemaMap[current_key]] = maxValVal;
                    rowData['responseOptions'] = rspObj;
                }
            }
/*
            //parse @type
            else if (schemaMap[current_key] === '@type') {

                // insert "@type":"xsd:anyURI" key inside responseOptions of the item
                if (rowData.hasOwnProperty('responseOptions')) {
                    rowData.responseOptions[schemaMap[current_key]] = "xsd:anyURI";
                }
                else {
                    rspObj[schemaMap[current_key]] = "xsd:anyURI";
                    rowData['responseOptions'] = rspObj;
                }
            }
*/

            // parse choice field
            else if (schemaMap[current_key] === 'choices' && data[current_key] !== '') {

                // split string wrt '|' to get each choice
                let c = data[current_key].split('|');
                // split each choice wrt ',' to get schema:name and schema:value
                c.forEach(ch => { // ch = { value, name}
                    let choiceObj = {};
                    let cs = ch.split(', ');
                    // create name and value pair for each choice option
                    choiceObj['schema:value'] = parseInt(cs[0]);
                    let cnameList = cs[1];
                    choiceObj['schema:name'] = cnameList;
                    choiceObj['@type'] = "schema:option";
                    choiceList.push(choiceObj);

                });
                // insert 'choices' key inside responseOptions of the item
                if (rowData.hasOwnProperty('responseOptions')) {
                    rowData.responseOptions[schemaMap[current_key]] = choiceList;
                }
                else {
                    rspObj[schemaMap[current_key]] = choiceList;
                    rowData['responseOptions'] = rspObj;
                }
            }

            // check all other response elements to be nested under 'responseOptions' key
            else if (responseList.indexOf(schemaMap[current_key]) > -1) {
                if (rowData.hasOwnProperty('responseOptions')) {
                    rowData.responseOptions[schemaMap[current_key]] = data[current_key];
                }
                else {
                    rspObj[schemaMap[current_key]] = data[current_key];
                    rowData['responseOptions'] = rspObj;
                }
            }

            // scoring logic
            else if (schemaMap[current_key] === 'scoringLogic' && data[current_key] !== '') {
                // set ui.hidden for the item to true by default
                if (rowData.hasOwnProperty('ui')) {
                    rowData.ui['hidden'] = true;
                }
                else {
                    ui['hidden'] = true;
                    rowData['ui'] = ui;
                }
                let condition = data[current_key];
                let s = condition;
                // normalize the condition field to resemble javascript
                let re = RegExp(/\(([0-9]*)\)/g);
                condition = condition.replace(re, "___$1");
                condition = condition.replace(/([^>|<])=/g, "$1 ==");
                condition = condition.replace(/\ and\ /g, " && ");
                condition = condition.replace(/\ or\ /g, " || ");
                re = RegExp(/\[([^\]]*)\]/g);
                condition = condition.replace(re, " $1 ");
                scoresObj = { [data['Variable / Field Name']]: condition };
            }

            // branching logic
            else if (schemaMap[current_key] === 'visibility') {
                let condition = true; // for items visible by default
                if (data[current_key]) {
                    condition = data[current_key];
                    let s = condition;
                    // normalize the condition field to resemble javascript
                    let re = RegExp(/\(([0-9]*)\)/g);
                    condition = condition.replace(re, "___$1");
                    condition = condition.replace(/([^>|<])=/g, "$1==");
                    condition = condition.replace(/\ and\ /g, " && ");
                    condition = condition.replace(/\ or\ /g, " || ");
                    re = RegExp(/\[([^\]]*)\]/g);
                    condition = condition.replace(re, "$1");
                }
                visibilityObj[[data['Variable / Field Name']]] = condition;
            }

            // decode html fields
            else if ((schemaMap[current_key] === 'question' || schemaMap[current_key] ==='schema:description'
                || schemaMap[current_key] === 'preamble') && data[current_key] !== '') {
                let questions = parseHtml(data[current_key]);
                console.log(231, form, schemaMap[current_key], questions);
                rowData[schemaMap[current_key]] = questions;
            }
            // non-nested schema elements
            else if (data[current_key] !== '')
                rowData[schemaMap[current_key]] = data[current_key];
        }
        // insert non-existing mapping as is for now
        // TODO: check with satra if this is okay
        // else if (current_key !== 'Form Name') {
        //     rowData[camelcase(current_key)] = data[current_key];
        // }
        // todo: requiredValue - should be true or false (instead of y or n)
        // todo: what does "textValidationTypeOrShowSliderNumber": "number" mean along with inputType: "text" ?
        // text with no value in validation column is -- text inputType
        // text with value in validation as "number" is of inputType - integer
        // text with value in validation as ddate_mdy is of inputType - date
        // dropdown and autocomplete??
    });
    const field_name = data['Variable / Field Name'];

    // add field to variableMap
    variableMap.push({"variableName": field_name, "isAbout": field_name});

    // check if 'order' object exists for the activity and add the items to the respective order array
    if (!order[form]) {
        order[form] = [];
        order[form].push(field_name);
    }
    else order[form].push(field_name);

    // write to item_x file
    fs.writeFile('activities/' + form + '/items/' + field_name, JSON.stringify(rowData, null, 4), function (err) {
        if (err) {
            console.log("error in writing item schema", err);
        }
    });
}


function createFormSchema(form, formContextUrl) {
    // console.log(27, form, visibilityObj);
    let jsonLD = {
        "@context": [schemaContextUrl, formContextUrl],
        "@type": "reproschema:Activity",
        "@id": `${form}_schema`,
        "skos:prefLabel": activityDisplayName,
        "skos:altLabel": `${form}_schema`,
        "schema:description": activityDescription,
        "schema:schemaVersion": "0.0.1",
        "schema:version": "0.0.1",
        // todo: preamble: Field Type = descriptive represents preamble in the CSV file., it also has branching logic. so should preamble be an item in our schema?
        "scoringLogic": scoresObj,
        "variableMap": variableMap,
        "ui": {
            "order": order[form],
            "shuffle": false,
            "visibility": visibilityObj
        }
    };
    const op = JSON.stringify(jsonLD, null, 4);
    // console.log(269, jsonLD);
    fs.writeFile(`activities/${form}/${form}_schema`, op, function (err) {
        if (err) {
            console.log("error in writing", form, " form schema", err)
        }
        else console.log(form, "Instrument schema created");
    });
}

function processActivities (activityName) {

    let condition = true; // for items visible by default
    protocolVisibilityObj[activityName] = condition;
    
    // add activity to variableMap and Order
    protocolVariableMap.push({"variableName": activityName, "isAbout": activityName});
    protocolOrder.push(activityName);

}

function createProtocolSchema(protocolName, protocolContextUrl) {
    let protocolSchema = {
        "@context": [schemaContextUrl, protocolContextUrl],
        "@type": "reproschema:ActivitySet",
        "@id": `${protocolName}_schema`,
        "skos:prefLabel": protocolDisplayName,
        "skos:altLabel": `${protocolName}_schema`,
        "schema:description": protocolDescription,
        "schema:schemaVersion": "0.0.1",
        "schema:version": "0.0.1",
        // todo: preamble: Field Type = descriptive represents preamble in the CSV file., it also has branching logic. so should preamble be an item in our schema?
        "variableMap": protocolVariableMap,
        "ui": {
            "order": protocolOrder,
            "shuffle": false,
            //"activity_display_name": activityDisplayObj,
            "visibility": protocolVisibilityObj
        }
    };
    const op = JSON.stringify(protocolSchema, null, 4);
    // console.log(269, jsonLD);
    fs.writeFile(`protocols/${protocolName}/${protocolName}_schema`, op, function (err) {
        if (err) {
            console.log("error in writing protocol schema")
        }
        else console.log("Protocol schema created");
    });

}

function parseLanguageIsoCodes(inputString){
    let languages = [];
    const root = HTMLParser.parse(inputString);
    if(root.childNodes.length > 0 && inputString.indexOf('lang') !== -1){
        if(root.childNodes){
            root.childNodes.forEach(htmlElement => {
                if (htmlElement.rawAttributes && htmlElement.rawAttributes.hasOwnProperty('lang')) {
                    languages.push(htmlElement.rawAttributes.lang)
                }
            });
        }
    }
    return languages;
}

function parseHtml(inputString) {
    let result = {};
    const root = HTMLParser.parse(inputString);
    if(root.childNodes.length > 0 ){
        if (root.childNodes) {
            root.childNodes.forEach(htmlElement => {
                if(htmlElement.text) {
                    if (htmlElement.rawAttributes && htmlElement.rawAttributes.hasOwnProperty('lang')) {
                        result[htmlElement.rawAttributes.lang] = htmlElement.text;
                    } else {
                        result[defaultLanguage] = htmlElement.text;
                    }
                }
            });
        }
    }
    else {
        result[defaultLanguage] = inputString;
    }
    return result;
}