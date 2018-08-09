const WebSocket = require('ws');

const URL = process.env.VIDEOSOCK_URL || 'ws://videosock.now.sh'
const ws = new WebSocket(URL);

const payload = process.argv.pop()

var cfg = {}
try {
    cfg = require('../config');
} catch (e) {
    console.log('no config defaulting to env vars', e)
}

if (process.env.VIDEO_SOCK_SECRET)
    cfg.secret = process.env.VIDEO_SOCK_SECRET

ws.on('open', function open() {
    console.error('sending payload', payload)
    ws.send(JSON.stringify({key: cfg.secret, payload}))
});

ws.on('message', function incoming(data) {
    console.log(data);
});
