'use strict';
const
    express = require('express'),
    request = require('request'),
    bodyParser = require('body-parser');

var app = express();
app.set('port', process.env.PORT || 5000);
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', function(req, res){
    console.log(123);
    res.status(200);
});

app.post('/webhook', function(req, res) {

    // if (req.query['hub.mode'] === 'subscribe' &&
    //     req.query['hub.verify_token'] === 'verify_token_aaa') {
    //     console.log("Validating webhook");
    //     res.status(200).send(req.query['hub.challenge']);
    // } else {
    //     console.error("Failed validation. Make sure the validation tokens match.");
    //     res.sendStatus(403);
    // }

    var data = req.body;
    console.log(data);
    if (data.object === 'page') {

        // Iterate over each entry - there may be multiple if batched
        data.entry.forEach(function(entry) {
            var pageID = entry.id;
            var timeOfEvent = entry.time;

            console.log(entry);
            // Iterate over each messaging event
            entry.messaging.forEach(function(event) {
                if (event.message) {
                    console.log('----- message -----');
                    console.log(event);
                    receivedMessage(event);
                } else {
                    console.log("Webhook received unknown event: ", event);
                }
            });
        });

        // Assume all went well.
        //
        // You must send back a 200, within 20 seconds, to let us know
        // you've successfully received the callback. Otherwise, the request
        // will time out and we will keep trying to resend.
        res.sendStatus(200);
    }

});

function receivedMessage(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;

    console.log("Received message for user %d and page %d at %d with message:",
        senderID, recipientID, timeOfMessage);
    console.log(JSON.stringify(message));

    var messageId = message.mid;

    var messageText = message.text;
    var messageAttachments = message.attachments;

    if (messageText) {

        // If we receive a text message, check to see if it matches a keyword
        // and send back the example. Otherwise, just echo the text we received.
        switch (messageText) {
            case 'generic':
                sendGenericMessage(senderID);
                break;
            default:
                sendTextMessage(senderID, 'Ano');
        }
    } else if (messageAttachments) {
        sendTextMessage(senderID, "Message with attachment received");
    }
}

function sendGenericMessage(recipientId, messageText) {
    // To be expanded in later sections
}

function sendTextMessage(recipientId, messageText) {

    var m = [
        'Ano',
        'Nie',
        'Si kokot uz',
        'Samo',
        'Je mi z teba zle',
        'A ty?',
        'Same kokotiny pises',
        'Zomri',
        'Klop klop',
        '2 + 2 = 9',
        'Tuka kabel',
        'Sme narafali',
        'Pil si ?',
        'Ty taty vieš',
        'Sufuzky',
        'Sufurky',
        'Pusti to rychlejsie',
        'My pojdeme',
        'Meral som si penis',
        'Všetko to beriem z rezervou lebo ťa beriem ako mentalne retardovaného',
        'Ja neviem už',
        'Tom tom'

    ];


    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: m[Math.floor(Math.random()*m.length)]
        }
    };

    callSendAPI(messageData);
}

function callSendAPI(messageData) {
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: 'EAAO9pRG6UZCUBAEeW582HVKVud4LZAo1X1uoQL0otQuCfZArXrCZArRWLdIx1dHt3jopOz8Q3MXX57oT3H7UNtQu0xPwiI8cpzJxygTQwGBZBh4T74dVyZCN6sZAtWW3t7OYLNgE9MhrTZAl9MO2PJgDzaZAAaqH0CCdK6rGwLlLHrAZDZD' },
        method: 'POST',
        json: messageData

    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var recipientId = body.recipient_id;
            var messageId = body.message_id;

            console.log("Successfully sent generic message with id %s to recipient %s",
                messageId, recipientId);
        } else {
            console.error("Unable to send message.");
            console.error(response);
            console.error(error);
        }
    });
}

// function verifyRequestSignature(req, res, buf) {
//     var signature = req.headers["x-hub-signature"];
//
//     if (!signature) {
//         // For testing, let's log an error. In production, you should throw an
//         // error.
//         console.error("Couldn't validate the signature.");
//     } else {
//         var elements = signature.split('=');
//         var method = elements[0];
//         var signatureHash = elements[1];
//
//         var expectedHash = crypto.createHmac('sha1', APP_SECRET)
//             .update(buf)
//             .digest('hex');
//
//         if (signatureHash != expectedHash) {
//             throw new Error("Couldn't validate the request signature.");
//         }
//     }
// }

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});