const logger = require('../../services/logger.service')
const userService = require('../user/user.service')
const carService = require('./car.service')

async function getCars(req, res) {
    try {
        const responce = await carService.query(req.query)
            res.send(responce)
    } catch (err) {
        logger.error('Cannot get responce (cars)', err)
        res.status(500).send({ err: 'Failed to get responce (cars)' })
    }
}

async function getCar(req, res) {
    try {
        const car = await carService.getById(req.params.id)
            res.send(car)
    } catch (err) {
        logger.error('Failed to get car', err)
        res.status(500).send({ err: 'Failed to get car' })
    }
}
async function getUserCars(req, res) {
    try {
        const responce = await carService.queryUserCars(req.params.id)
        res.send(responce)
    } catch (err) {
        logger.error('Cannot get responce (userCars)', err)
        res.status(500).send({ err: 'Failed to get responce (userCars)' })
    }
}

async function addCar(req, res) {
    try {
        const car = req.body
        if (!car.fake) {
            const userId = req.session.user._id
            const user = await userService.getById(userId)    
            car.owner = {}
            car.owner._id = user._id;
            car.owner.fullname = user.fullname
            car.owner.imgUrl = user.imgUrl;      
            car.auction.createdAt = Date.now()
            car.informed = false
            const savedCar = await carService.add(car)
            res.send(savedCar)
        }   
        else {
            car.owner = await _makeRandomUser()
            car.comments = []
            car.likes = []
            car.msgs = []    
            car.auction = {}
            car.auction.startPrice = _getRandomInt(20000, 40000)
            car.auction.status = 'active',
            car.auction.duration = 1000 * 60 * 60 * 24 * 7,
            car.auction.bids = []
            car.auction.createdAt = Date.now() - 1000*60*60*24*6 - 1000*60*60*23 - 1000*60*_getRandomInt(55,59);
            car.informed = false
            const savedCar = await carService.add(car)
            res.send(savedCar)
        }
    } catch (err) {
        logger.error('Failed to add car', err)
        res.status(500).send({ err: 'Failed to add car' })
    }
}

async function addTime(req, res) {
    const carId = req.body.carId
    await carService.addTime(carId)
    res.send(carId)
}

async function addComment(req, res) {
    const userId = req.session.user._id
    const user = await userService.getById(userId)
    var comment = req.body
    comment.id = _makeId();
    comment.by = {}
    comment.by._id = user._id;
    comment.by.fullname = user.fullname
    comment.by.imgUrl = user.imgUrl;  
    comment.createdAt = Date.now();
    const car = await carService.addComment(comment)
    res.send(car)
}
 
async function addBid(req, res) {
    const userId = req.session.user._id
    const user = await userService.getById(userId)
    var bid = req.body
    bid.id = _makeId();
    bid.by = {}
    bid.by._id = user._id;
    bid.by.fullname = user.fullname
    bid.by.imgUrl = user.imgUrl;  
    bid.createdAt = Date.now();
    const car = await carService.addBid(bid)
    res.send(car)
}

async function addLike(req, res) {
    const userId = req.session.user._id
    const user = await userService.getById(userId)
    var like = req.body
    like.id = _makeId();
    like.by = {}
    like.by._id = user._id;
    like.by.fullname = user.fullname
    like.by.imgUrl = user.imgUrl;  
    like.createdAt = Date.now();
    like = await carService.addLike(like)
    res.send(like)
}

async function removeLike(req, res) {
    try {
        await carService.removeLike(req.params.id,req.session.user._id)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to delete car', err)
        res.status(500).send({ err: 'Failed to delete car' })
    }
}

function _getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function _makeId(length = 5) {
    var txt = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return txt;
}

async function _makeRandomUser() {
    var users = await userService.query();
    const idx = _makeRandomInt(0, users.length - 1);
    var minimalUser = {
        _id: users[idx]._id,
        fullname: users[idx].fullname,
        imgUrl: users[idx].imgUrl
    }
    return minimalUser
}

function _makeRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

module.exports = {
    getCars,
    getCar,
    getUserCars,
    addCar,
    addComment,
    addBid,
    addLike,
    removeLike,
    addTime
}