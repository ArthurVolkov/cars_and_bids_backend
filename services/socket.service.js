const asyncLocalStorage = require('./als.service');
const logger = require('./logger.service');
const carService = require('../api/car/car.service')

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
            console.log('Topic before:',socket.myTopic,topic)
            if (socket.myTopic === topic) return;
            if (socket.myTopic) {
                console.log('Leaving...')
                socket.leave(socket.myTopic)
            }
            socket.join(topic)
            // logger.debug('Session ID is', socket.handshake.sessionID)
            socket.myTopic = topic
        })
        socket.on('details newBid', bid => {
            socket.broadcast.to(socket.myTopic).emit('details addBid', bid)
            var msg = {};
            msg._id = socket.myTopic;
            carService.getById(msg._id)
                .then (car => {
                    msg.carId = car._id
                    msg.vendor = car.vendor
                    msg.year = car.year
                    msg.model = car.model
                    msg.type = 'bid';
                    msg.data = bid.price + '';
                    msg.createdAt = bid.createdAt;
                    msg.by = bid.by
                    console.log('LLLLLLLLLL',msg)        
                    carService.addMsg(msg)            
                    gIo.emit('cars newMsg', msg)        
                }) 
        })
        socket.on('details newComment', function(comment) {
            socket.broadcast.to(socket.myTopic).emit('details addComment', comment)
            var msg = {};
            msg._id = socket.myTopic;
            carService.getById(msg._id)
                .then (car => {
                    msg.carId = car._id
                    msg.vendor = car.vendor
                    msg.year = car.year
                    msg.model = car.model
                    msg.type = 'comment';
                    msg.data = comment.txt;
                    msg.createdAt = comment.createdAt;
                    msg.by = comment.by        
                    carService.addMsg(msg)            
                    gIo.emit('cars newMsg', msg)        
                }) 
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



