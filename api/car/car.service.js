const dbService = require('../../services/db.service')
const ObjectId = require('mongodb').ObjectId
// const asyncLocalStorage = require('../../services/als.service')

async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy)
//  const criteria = {}
    const skip = filterBy.pageIdx * filterBy.pageSize
    const limit = +filterBy.pageSize
    try {
        const collection = await dbService.getCollection('cars')
        if (filterBy.sortBy === 'ending-soon'){
            var sortBy = { 'auction.createdAt' : 1 }    
        } else if (filterBy.sortBy === 'newly-listed') {
            sortBy = { 'auction.createdAt' : -1 }        
        } else if (filterBy.sortBy === 'lowest-mileage') {
            sortBy = { 'mileage' : 1 }
        }
        var cars = await collection.find(criteria).sort(sortBy).skip(skip).limit(limit).toArray()
        console.log('cars:', cars)
        var count = await collection.count()
        return [cars, count]
    } catch (err) {
        logger.error('Cannot find cars', err)
        throw err
    }
}

async function queryUserCars(userId = '') {
    const criteria = _buildUserCriteria(userId)
    try {
        const collection = await dbService.getCollection('cars')
        var cars = await collection.find(criteria).toArray()
        return cars
    } catch (err) {
        logger.error('Cannot find users cars', err)
        throw err
    }
}

async function getById(carId) {
    try {
        const collection = await dbService.getCollection('cars')
        const car = await collection.findOne({ '_id': ObjectId(carId) })
        return car
    } catch (err) {
        logger.error(`Error while finding car ${carId}`, err)
        throw err
    }
}

async function addComment(comment) {
    const _id = ObjectId(comment.carId)
    delete comment.carId
    const collection = await dbService.getCollection('cars')
    await collection.updateOne({ '_id': _id }, { $push: {'comments': comment }})
    return comment;    
}

async function addBid(bid) {
    const _id = ObjectId(bid.carId)
    delete bid.carId
    const collection = await dbService.getCollection('cars')
    await collection.updateOne({ '_id': _id }, { $push: {'auction.bids': bid }})
    return bid;    
}

async function addLike(like) {
    const _id = ObjectId(like.carId)
    delete like.carId
    const collection = await dbService.getCollection('cars')
    await collection.updateOne({ _id }, { $push: {'likes': like }})
    return like;    
}

async function removeLike(carId,userId) {
    const _id = ObjectId(carId)
    const uId = ObjectId(userId)
    const collection = await dbService.getCollection('cars')
    await collection.updateOne({ '_id': _id }, { $pull: {'likes': {'by._id': uId }}})
    return carId;    
}

async function addMsg(msg) {
    try {
        const _id = msg._id;
        delete msg._id;

        const collection = await dbService.getCollection('cars')
        await collection.updateOne({"_id":ObjectId(_id)}, {$push : {msgs: msg}})
        return msg
    } catch (err) {
        console.log(`ERROR: cannot update toy ${toy._id}`)
        throw err;
    }
}

async function add(car) {
    try {
        const collection = await dbService.getCollection('cars')
        await collection.insertOne(car)
        return car;
    } catch (err) {
        logger.error('cannot insert car', err)
        throw err
    }
}

module.exports = {
    query,
    queryUserCars,
    add,
    getById,
    addComment,
    addBid,
    addLike,
    removeLike,
    addMsg
}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.name) {
        const txtCriteria = { $regex: filterBy.name, $options: 'i' }
        criteria.$or = [
            {
                vendor: txtCriteria
            },
            {
                bodyStyle: txtCriteria
            },
            {
                transmission: txtCriteria
            },
            {
                drivetrain: txtCriteria
            },
            {
                engine: txtCriteria
            },
            {
                exteriorColor: txtCriteria
            },
            {
                interiorColor: txtCriteria
            },
            {
                desc: txtCriteria
            }
        ]
    }
    if (filterBy.bodyStyles && filterBy.bodyStyles !== 'all') {
        criteria.bodyStyle = { $eq: filterBy.bodyStyles }
    }
    if (filterBy.vendors && filterBy.vendors !== 'all') {
        const vendors = filterBy.vendors.split(',')
        criteria.vendor = { $in: vendors }
    }
    const years = filterBy.years.split(',').map(x=>+x);
    criteria.year = { $gt: years[0], $lte: years[1] }
    return criteria
}

function _buildUserCriteria(userId) {
    const criteria = {}
    if (userId) {
        userId = ObjectId(userId)
        criteria.$or = [
            {
                'owner._id': userId
            },
            {
                'likes.by._id': userId
            },
            {
                'auction.bids.by._id': userId
            },
            {
                'comments.by._id': userId
            }
        ]
    }
    return criteria
}


