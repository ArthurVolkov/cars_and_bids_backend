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
        gSocketBySessionIdMap[socket.handshake.sessionID] = socket
        socket.on('disconnect', socket => {
            console.log('Someone disconnected')
            if (socket.handshake) {
                gSocketBySessionIdMap[socket.handshake.sessionID] = null
            }
        })
        socket.on('details topic', topic => {
            if (socket.myTopic === topic) return;
            if (socket.myTopic) {
                console.log('Leaving...')
                socket.leave(socket.myTopic)
            }
            socket.join(topic)
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
        socket.on('details newLike', function(like) {
            socket.broadcast.to(like.carId).emit('details changeLike', like)
            if (like.isAdd) {
                var msg = {};
                msg._id = like.carId;
                carService.getById(msg._id)
                    .then (car => {
                        msg.carId = car._id
                        msg.vendor = car.vendor
                        msg.year = car.year
                        msg.model = car.model
                        msg.type = 'like';
                        msg.data = 'true';
                        msg.createdAt = like.createdAt;
                        msg.by = like.by        
                        carService.addMsg(msg)            
                        gIo.emit('cars newMsg', msg)        
                    }) 
            }
        })
        socket.on('details newCar', function(car) {
            var msg = {};
            msg._id = car._id;
            msg.carId = car._id
            msg.vendor = car.vendor
            msg.year = car.year
            msg.model = car.model
            msg.type = 'car';
            msg.data = '';
            msg.createdAt = car.auction.createdAt;
            msg.by = car.owner        
            carService.addMsg(msg)            
            gIo.emit('cars newMsg', msg)        
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



