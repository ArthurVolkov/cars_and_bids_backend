const express = require('express')
const {requireAuth, requireAdmin} = require('../../middlewares/requireAuth.middleware')
const {log} = require('../../middlewares/logger.middleware')
const {getCars, getCar, updateCar, addCar, deleteCar, addComment,addBid} = require('./car.controller')
// const {getCars, getCar, updateCar, addCar, deleteCar, addReview} = require('./car.controller')
// const { addReview } = require('../review/review.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', log, getCars)
router.get('/:id', getCar)
router.put('/:id', requireAuth, requireAdmin, updateCar)
router.post('/comment', addComment)
router.post('/bid', addBid)
router.post('/', addCar)
router.delete('/:id', requireAuth, requireAdmin, deleteCar)

module.exports = router