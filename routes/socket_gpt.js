const WebSocket = require('ws');

export default class CameraWebSocket {
    constructor(url) {
        this.socket = new WebSocket(url);
        this.messageQueue = []; // 初始化消息队列
        this.socket.on('open', this.handleOpen.bind(this));
        this.socket.on('message', this.handleMessage.bind(this));
        this.socket.on('close', this.handleClose.bind(this));
        this.socket.on('error', this.handleError.bind(this));
    }

    handleOpen() {
        console.log('WebSocket connection established.');
        this.send({
            "packettype": 1, "cameraid": 320000003, "timestamp": new Date(),
            "name": "Camera Test.", "user": "admin", "password": "a8888888"
        });
        this.flushMessageQueue(); // 连接建立后发送所有排队的消息
    }

    handleMessage(message) {
        const data = JSON.parse(message);
        if (data.errorcode === 406 || data.errorcode === 407) {
            console.log(`Error ${data.errorcode}: Clearing coordinates.`);
            data.land = [];
        } else if (data.packetscr === 7) {
            console.log('Received frame coordinate message.');
        }
        console.log('Message received:', message.toString('utf8'));
    }

    handleClose() {
        console.log('WebSocket connection closed.');
    }

    handleError(error) {
        console.error('WebSocket error:', error);
    }

    send(message) {
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            console.log('WebSocket is not open. Queueing message.');
            this.messageQueue.push(message); // 如果连接未开放，加入队列
        }
    }

    flushMessageQueue() {
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            this.send(message);
        }
    }

    close() {
        this.socket.close();
    }
}