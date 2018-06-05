/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 * This sample supports multiple lauguages. (en-US, en-GB, de-DE).
 * The Intent Schema, Custom Slots and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-fact
 **/

'use strict';
const Alexa = require('alexa-sdk');
const get_next_bin = require('./bin_calendar').next;

//=========================================================================================================================================
//TODO: The items below this comment need your attention.
//=========================================================================================================================================

//Replace with your app ID (OPTIONAL).  You can find this value at the top of your skill's page on http://developer.amazon.com.
//Make sure to enclose your value in quotes, like this: const APP_ID = 'amzn1.ask.skill.bb4045e6-b3e8-4133-b650-72923c5980f1';
const APP_ID = undefined;

const params = {
    TableName: 'Temperature',
    Key: { "room": 'downstairs' }
}

//=========================================================================================================================================
//Editing anything below this line might break your skill.
//=========================================================================================================================================

const handlers = {
    'LaunchRequest': function () {
        this.emit('Temperature');
    },
    'Temperature': function() {

        let location = this.event.request.intent.slots.location.value
        console.log("Location requested:", location);
        if (location === "upstairs") {
            location = "first-floor";
        }
        const params = {
            TableName: 'Temperature',
            Key: { "room": location }
        }

        readDynamoItem(params, (result)=> {

            let temperature = 0.0;
            if (typeof result === 'number')
                temperature = result;
            else
                temperature = result.temperature;


            this.response.speak("It's " + temperature.toFixed(1) + " degrees.");
            this.emit(':responseReady');
        });


    },
    'bins': function() {
        get_next_bin((result) => {

            this.response.speak(result);
            this.emit(':responseReady');
        });
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = "You can say 'what is the temperature downstairs'";
        const reprompt = "Which room would you like to know about?";

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak("OK");
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak("OK");
        this.emit(':responseReady');
    },
};

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

function readDynamoItem(params, callback) {

    var AWS = require('aws-sdk');
    AWS.config.update({region: "eu-west-1"});

    var docClient = new AWS.DynamoDB.DocumentClient();

    console.log('reading item from DynamoDB table');

    docClient.get(params, (err, data) => {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));

            callback(data.Item.temperature);  // this particular row has an attribute called message

        }
    });

}
