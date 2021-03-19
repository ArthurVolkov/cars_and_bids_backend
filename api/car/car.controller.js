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
        console.log('BBBBBBBBBB')
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
        const car = req.body
        const savedUser = await carService.add(car)
        res.send(savedUser)

    } catch (err) {
        logger.error('Failed to add car', err)
        res.status(500).send({ err: 'Failed to add car' })
    }
}
 
async function addReview(req, res) {
    try {
        const review = req.body
        review.owner = req.session.user.fullname
        console.log('review:', review)
        // console.log('req.session.user:', req.session.user)
        const savedReview = await carService.addReview(review)
        res.send(savedReview)

    } catch (err) {
        logger.error('Failed to add review', err)
        res.status(500).send({ err: 'Failed to add review' })
    }
}

module.exports = {
    getCars,
    getCar,
    deleteCar,
    addCar,
    updateCar,
    addReview
}