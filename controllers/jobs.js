const Job = require('../models/Job')
const { isValidObjectId } = require('mongoose')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')

/*
 - getAllJobs
 - getJob
 - createJob
 - updateJob
 - deleteJob
*/

const getAllJobs = async (req, res) => {
    const jobs = await Job.find({createdBy: req.user.userId}).sort('createdAt');
    if (!jobs) {
        return res.status(StatusCodes.NO_CONTENT).json({});
    }
    res.status(StatusCodes.OK).json({ jobs, count: jobs.length });
}

const getJob = async (req, res) => {
    const {user:{userId}, params:{id: jobId}} = req;
    if (isValidObjectId(userId) && isValidObjectId(jobId)){ // checking if userId, jobId are vaild ObjectId
        const job = await Job.findOne({
            _id: jobId,
            createdBy: userId
        })
        if (!job) {
            throw new NotFoundError(`No job with id ${jobId}`)
        }
        res.status(StatusCodes.OK).json({ job })
    } else {
        throw new NotFoundError(`No job with id ${jobId}`)
    }


}

const createJob = async (req, res) => {
    req.body.createdBy = req.user.userId
    const job = await Job.create(req.body)
    res.status(StatusCodes.CREATED).json({ job })
}

const updateJob = async (req, res) => {
    const {
        body: { company, position },
        user: { userId },
        params: { id: jobId }
    } = req;

    if (company === '' || position === '') {
        throw new BadRequestError('These fields are required (company, position)');
    }

    if (isValidObjectId(userId) && isValidObjectId(jobId)){ // checking if userId, jobId are vaild ObjectId
        const job = await Job.findOneAndUpdate(
            { _id: jobId, createdBy: userId },
            { company, position },
            { new: true, runValidators: true }
        )
        if (!job) {
            throw new NotFoundError(`no job with id ${jobId}`)
        }
        res.status(StatusCodes.OK).json({ job })
    } else {
        throw new NotFoundError(`no job with id ${jobId}`)
    }
}

const deleteJob = async (req, res) => {
    const { user: {userId}, params:{id: jobId} } = req
    if (isValidObjectId(userId) && isValidObjectId(jobId)){ // checking if userId, jobId are vaild ObjectId
        const job = await Job.findOneAndDelete({
            _id: jobId,
            createdBy: userId
        })
        if (!job) {
            throw new NotFoundError(`no job with id ${jobId}`);
        }
        res.status(StatusCodes.OK).send();
    } else {
        throw new NotFoundError(`no job with id ${jobId}`);
    }
}

module.exports = {
    getAllJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob
}