const Pusher = require("pusher");

const pusher = new Pusher({
    appId: "1335813",
    key: "cc1cf9f27928049eef7f",
    secret: "fcdfa7d7cf3a6dd19e3d",
    cluster: "eu",
    useTLS: true
});

module.exports = pusher;
