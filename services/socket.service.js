const asyncLocalStorage = require('./als.service');
const logger = require('./logger.service');
const toyService = require('../api/car/car.service')

var gIo = null
var gSocketBySessionIdMap = {}

function connectSockets(http, session) {
    gIo = require('socket.io')(http);

    const sharedSession = require('express-socket.io-session');

    gIo.use(sharedSession(session, {
        autoSave: true
    }));
    gIo.on('connection', socket => {
        console.log('CONNECTED')
        // console.log('socket.handshake', socket.handshake)
        gSocketBySessionIdMap[socket.handshake.sessionID] = socket
        // TODO: emitToUser feature - need to tested for CaJan21
        // if (socket.handshake?.session?.user) socket.join(socket.handshake.session.user._id)
        socket.on('disconnect', socket => {
            console.log('Someone disconnected')
            if (socket.handshake) {
                gSocketBySessionIdMap[socket.handshake.sessionID] = null
            }
        })
        socket.on('details topic', topic => {
            console.log('Topic before:',topic)
            if (socket.myTopic === topic) return;
            if (socket.myTopic) {
                socket.leave(socket.myTopic)
            }
            socket.join(topic)
            // logger.debug('Session ID is', socket.handshake.sessionID)
            socket.myTopic = topic
            console.log('Topic after:',topic)
        })
        socket.on('details newBid', bid => {
            console.log('BID befor:',bid)
            socket.broadcast.to(socket.myTopic).emit('details addBid', bid)
            console.log('BID after:',bid)
            //            gIo.to(socket.myTopic).emit('chat addMsg', msg)
        })
        socket.on('details newComment', comment => {
            socket.broadcast.to(socket.myTopic).emit('details addComment', comment)
//            gIo.to(socket.myTopic).emit('chat addMsg', msg)
        })
        socket.on('typing', msg => {
            // emits to all sockets:
            // gIo.emit('chat addMsg', msg)
            // emits only to sockets in the same room

            socket.broadcast.to(socket.myTopic).emit('is typing', msg)
        })
        socket.on('admin change', msg => {
            console.log('HHHHEEEE')
            // emits to all sockets:
            // gIo.emit('chat addMsg', msg)
            // emits only to sockets in the same room

            gIo.emit('admin', msg)
        })
    })
}

function emit({ type, data }) {
    gIo.emit(type, data)
}

// TODO: Need to test emitToUser feature
function emitToUser({ type, data, userId }) {
    gIo.to(userId).emit(type, data)
}


// Send to all sockets BUT not the current socket 
function broadcast({ type, data }) {
    const store = asyncLocalStorage.getStore()
    const { sessionId } = store
    if (!sessionId) return logger.debug('Shoudnt happen, no sessionId in asyncLocalStorage store')
    const excludedSocket = gSocketBySessionIdMap[sessionId]
    if (!excludedSocket) return logger.debug('Shouldnt happen, No socket in map', gSocketBySessionIdMap)
    excludedSocket.broadcast.emit(type, data)
}


module.exports = {
    connectSockets,
    emit,
    broadcast
}



