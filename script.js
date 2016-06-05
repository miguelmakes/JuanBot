'use strict';

const _ = require('lodash');
const Script = require('smooch-bot').Script;

const scriptRules = require('./script.json');

module.exports = new Script({
    processing: {
        //prompt: (bot) => bot.say('Beep boop...'),
        receive: () => 'processing'
    },

    start: {
        receive: (bot) => {
            return bot.say('Hello there! My name is Juan, Miguel\'s personal bot. To get started, enter \"YO BOT\"')
                .then(() => 'speak');
        }
    },

    speak: {
        receive: (bot, message) => {

            let upperText = message.text.trim().toUpperCase();

            function updateSilent() {
                switch (upperText) {
                    case "CONNECT ME":
                        return bot.setProp("silent", true);
                    case "DISCONNECT":
                        return bot.setProp("silent", false);
                    default:
                        return Promise.resolve();
                }
            }

            function getSilent() {
                return bot.getProp("silent");
            }

            function processMessage(isSilent) {
                if (isSilent) {
                    return Promise.resolve("speak");
                }

                if (!_.has(scriptRules, upperText)) {
                    var inputArray = upperText.split(' ');
                    var commands = Object.keys(scriptRules);

                    var matchedWordsCounter = 0;
                    var perfectMatch = "";

                    for (var k = 0; k < commands.length; k++) {
                        var commandArray = commands[k].split(' ');

                        for (var l = 0; l < commandArray.length; l++) {
                            for (var m = 0; m < inputArray.length; m++) {
                                if (commandArray[l] == inputArray[m]) {
                                    matchedWordsCounter++;

                                    if (matchedWordsCounter === commandArray.length) {
                                        perfectMatch = commands[k];
                                    }
                                }
                            }
                        }
                    }

                    if (perfectMatch.length > 0) {
                        upperText = perfectMatch;
                    } else {
                        return bot.say(`I didn't understand that.`).then(() => 'speak');
                    }
                }

                /* *** */

                var response = scriptRules[upperText];

                var lines = response.split('\n');

                var p = Promise.resolve();
                _.each(lines, function(line) {
                    line = line.trim();
                    p = p.then(function() {
                        // console.log(line);
                        return bot.say(line + "/ ORIGINAL: " + upperText);
                    });
                })

                return p.then(() => 'speak');
            }

            return updateSilent()
                .then(getSilent)
                .then(processMessage);
        }
    }
});
