const logger = require('../../services/logger.service')
const userService = require('../user/user.service')
const carService = require('./car.service')

async function getCars(req, res) {
    try {
        // console.log('req.query:', req.query)
        const responce = await carService.query(req.query)
        /////////////////////////////////////////////
        // setTimeout(() => { 
            res.send(responce)
        // }, 500);
        /////////////////////////////////////////////
    } catch (err) {
        logger.error('Cannot get responce (cars)', err)
        res.status(500).send({ err: 'Failed to get responce (cars)' })
    }
}


async function getCar(req, res) {
    try {
        const car = await carService.getById(req.params.id)
        ////////////////////////////////////////////
        // setTimeout(() => { 
            res.send(car)
        // }, 500);
        ///////////////////////////////////////////
    } catch (err) {
        logger.error('Failed to get car', err)
        res.status(500).send({ err: 'Failed to get car' })
    }
}

async function deleteCar(req, res) {
    try {
        await carService.remove(req.params.id)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to delete car', err)
        res.status(500).send({ err: 'Failed to delete car' })
    }
}


async function updateCar(req, res) {
    try {
        const car = req.body
        const savedCar = await carService.update(car)
        res.send(savedCar)
    } catch (err) {
        logger.error('Failed to update car', err)
        res.status(500).send({ err: 'Failed to update car' })
    }
}

async function addCar(req, res) {
    try {
        const userId = req.session.user._id
        const user = await userService.getById(userId)
        const car = req.body
        car.owner = {}
        car.owner._id = user._id;
        car.owner.fullname = user.fullname
        car.owner.imgUrl = user.imgUrl;      
        car.auction.createdAt = Date.now();
        const savedCar = await carService.add(car)
        res.send(savedCar)

    } catch (err) {
        logger.error('Failed to add car', err)
        res.status(500).send({ err: 'Failed to add car' })
    }
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
    const car = await carService.addLike(like)
    res.send(car)
}

async function removeLike(req, res) {
    try {
        console.log('PPPPPPPPPPPPPP')
        await carService.removeLike(req.params.id)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to delete car', err)
        res.status(500).send({ err: 'Failed to delete car' })
    }
}

function _makeId(length = 5) {
    var txt = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return txt;
}

module.exports = {
    getCars,
    getCar,
    deleteCar,
    addCar,
    updateCar,
    addComment,
    addBid,
    addLike,
    removeLike
}