const express = require('express')
const {requireAuth, requireAdmin} = require('../../middlewares/requireAuth.middleware')
const {log} = require('../../middlewares/logger.middleware')
const {getCars, getCar, getUserCars, addCar, addComment,addBid,addLike,removeLike, addTime} = require('./car.controller')
// const {getCars, getCar, updateCar, addCar, deleteCar, addReview} = require('./car.controller')
// const { addReview } = require('../review/review.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', log, getCars)
router.get('/user/:id?', getUserCars)
router.get('/:id', getCar)
router.post('/', addCar)
router.post('/comment', addComment)
router.post('/bid', addBid)
router.post('/like', addLike)
router.post('/time', addTime)
router.delete('/like/:id', removeLike)

module.exports = router