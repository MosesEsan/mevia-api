const prisma = require("../config/prisma");
// import Expo from 'expo-server-sdk';

//Add user device token to database
exports.store = async function (req, res) {
    try{
        let user_id = req.user.id;

        const push_notification = await prisma.pushNotification.upsert({
            where: {user_id: parseInt(user_id)},
            update: {active:true},
            create: {
                userId: parseInt(user_id),
                deviceToken: req.body.device_token,
                active: true
            },
        })

        res.status(200).json(push_notification)
    }catch (error) {
        res.status(500).json(error);
    }
}

//Update the device token active flag
exports.update = async function (req, res, active =false) {
    try{
        let user_id = req.user.id;

        const notification = await prisma.pushNotification.update({where: { user_id: parseInt(user_id) }, data:{active}})

        res.status(200).json(notification)
    }catch (error) {
        res.status(500).json(error);
    }
}






//=============
//
// //push to a single user
// exports.single = (req, res) => {
//     const {user_id, title, message} = req.body;
//
//     push_single(user_id, {title, message})
//         .then((result) => res.status(200).json(result))
//         .catch((error) => res.status(500).json(error));
// }
//
// function push_single(user_id, data) {
//     return new Promise(async (resolve, reject) => {
//         const user_notification = await prisma.pushNotification.update({where: { user_id: parseInt(user_id) }, data:{active: true}});
//
//         let messages = createNotifications([user_notification], data)
//         pushWithExpo(messages).then((result) => resolve(result))
//     })
// }
// exports.push_single = push_single;
//
//
// function createNotifications(notifications, data) {
//     let messages = [];
//     let title = "New Challenge Alert"
//     let body = "A new challenge is available, open the app to play and win points towards that prize you have been eyeing. :)"
//
//     notifications.map((notification, idx) => {
//         notification = notification.toJSON()
//         console.log(notification)
//
//         let deviceToken = notification.deviceToken;
//         // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
//
//         // Check that all your push tokens appear to be valid Expo push tokens
//         if (!Expo.isExpoPushToken(deviceToken)) {
//             console.error(`Push token ${deviceToken} is not a valid Expo push token`);
//         } else {
//             // Construct a message (see https://docs.expo.io/versions/latest/guides/push-notifications.html)
//             messages.push({to: deviceToken, sound: 'default', data, title, body, badge: 1})
//         }
//     })
//
//     return messages;
// }
//
// function pushWithExpo(messages) {
//     return new Promise((resolve, reject) => {
//         // that you don't need to send 1000 requests to send 1000 notifications. We
// // recommend you batch your notifications to reduce the number of requests
// // and to compress them (notifications with similar content will get
// // compressed).
//         let chunks = expo.chunkPushNotifications(messages);
//         let tickets = [];
//         (async () => {
//             // Send the chunks to the Expo push notification service. There are
//             // different strategies you could use. A simple one is to send one chunk at a
//             // time, which nicely spreads the load out over time:
//             for (let chunk of chunks) {
//                 try {
//                     let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
//                     console.log(ticketChunk);
//                     tickets.push(...ticketChunk);
//                     // NOTE: If a ticket contains an error code in ticket.details.error, you
//                     // must handle it appropriately. The error codes are listed in the Expo
//                     // documentation:
//                     // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
//                 } catch (error) {
//                     console.error(error);
//                 }
//             }
//
//             resolve(tickets);
//         })();
//     })
//
//
// // Later, after the Expo push notification service has delivered the
// // notifications to Apple or Google (usually quickly, but allow the the service
// // up to 30 minutes when under load), a "receipt" for each notification is
// // created. The receipts will be available for at least a day; stale receipts
// // are deleted.
// //
// // The ID of each receipt is sent back in the response "ticket" for each
// // notification. In summary, sending a notification produces a ticket, which
// // contains a receipt ID you later use to get the receipt.
// //
// // The receipts may contain error codes to which you must respond. In
// // particular, Apple or Google may block apps that continue to send
// // notifications to devices that have blocked notifications or have uninstalled
// // your app. Expo does not control this policy and sends back the feedback from
// // Apple and Google so you can handle it appropriately.
//     let receiptIds = [];
//     for (let ticket of tickets) {
//         // NOTE: Not all tickets have IDs; for example, tickets for notifications
//         // that could not be enqueued will have error information and no receipt ID.
//         if (ticket.id) {
//             receiptIds.push(ticket.id);
//         }
//     }
//
//     let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
//     (async () => {
//         // Like sending notifications, there are different strategies you could use
//         // to retrieve batches of receipts from the Expo service.
//         for (let chunk of receiptIdChunks) {
//             try {
//                 let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
//                 console.log(receipts);
//
//                 // The receipts specify whether Apple or Google successfully received the
//                 // notification and information about an error, if one occurred.
//                 for (let receipt of receipts) {
//                     if (receipt.status === 'ok') {
//                         continue;
//                     } else if (receipt.status === 'error') {
//                         console.error(`There was an error sending a notification: ${receipt.message}`);
//                         if (receipt.details && receipt.details.error) {
//                             // The error codes are listed in the Expo documentation:
//                             // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
//                             // You must handle the errors appropriately.
//                             console.error(`The error code is ${receipt.details.error}`);
//                         }
//                     }
//                 }
//             } catch (error) {
//                 console.error(error);
//             }
//         }
//     })();
//     //
//     // var dataString = '{"to": "ExponentPushToken[_pusvWC1RUZzViyAash3_i]",' +
//     //     '"data": {"action": "challenge_available", "title": "New Challenge Alert", "body": "A new challenge is available, open the app to play and win points towards that prize you have been eyeing. :)"},"title": "New Challenge Alert","body": "A new challenge is available, open the app to play and win points towards that prize you have been eyeing. :)","badge": 0}';
//     //
//     // var options = {
//     //     url: 'https://exp.host/--/api/v2/push/send',
//     //     method: 'POST',
//     //     headers: headers,
//     //     body: dataString
//     // };
//     //
//     // request(options, callback);
// }
