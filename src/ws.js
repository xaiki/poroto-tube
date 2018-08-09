import {EventEmitter} from 'events'
const WebSocket = window.WebSocket

export default class WS extends EventEmitter {
    constructor (url) {
        super()
        this.backoff = 200
        this.connecting = false
        this.queue = []
        if (url) this.open(url)
    }

    open(url) {
        this.connecting = true
        this.url = url
        if (this._tick) {
            clearInterval(this._tick)
        }
        this.ws = new WebSocket(url)
        this.ws.onerror = err => {
            console.error(err)
            setTimeout(() => this.open(url), this.backoff)
            this.backoff *= 2
        }
        this.ws.onmessage = data => {
            this.emit('message', data)
        }
        this.ws.onclose = () => this.open(url)
        this.ws.onopen = () => {
            this.backoff = 200
            this.connecting = false
            this.ws._tick = setInterval(() => this.send('ping'))
            if (this.queue.length) {
                while (this.queue.length) {
                    this.send(this.queue.shift())
                }
            }
        }
    }

    send(data) {
        if (this.ws.readyState !== WebSocket.OPEN) {
            if (! this.connecting && this.url)
                this.open(this.url)
            return this.queue.push(data)
        }
        if (typeof data === 'string') return this.ws.send(data)
        return this.ws.send(JSON.stringify(data))
    }
}
