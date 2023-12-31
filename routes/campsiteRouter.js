const express = require('express')
const Campsite = require('../models/campsite')
const authenticate = require('../authenticate') // verifyUser, along with all other exports from authenticate.js are accesible in this file
const cors = require('./cors') // if '/cors' it will import the npm cors module, not the one we made 'cors.js

const campsiteRouter = express.Router()

// http://localhost:3000/campsites/
campsiteRouter.route('/')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200)) // handles the preflight request
  .get(cors.cors, (req, res, next) => { // default
    Campsite.find()
      .populate('comments.author') // this will tell our application that when the campsite documents are retrieved, to populate the author field of a comments sub document by finding the user document that matches the object ID thats stored there
      .then(campsites => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(campsites)
      })
      .catch(err => next(err))
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => { // custom cors
    Campsite.create(req.body)
      .then(campsite => {
        console.log('Campsite Created ', campsite)
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(campsite)
      })
      .catch(err => next(err))
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403
    res.end('PUT operation not supported on /campsites')
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Campsite.deleteMany()
      .then(response => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(response)
      })
      .catch(err => next(err))
  })

// http://localhost:3000/campsites/<campsiteId>
campsiteRouter.route('/:campsiteId')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
      .populate('comments.author')
      .then(campsite => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(campsite)
      })
      .catch(err => next(err))
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403
    res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`)
  })
  .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Campsite.findByIdAndUpdate(req.params.campsiteId, {
      $set: req.body
    }, { new: true })
      .then(campsite => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(campsite)
      })
      .catch(err => next(err))
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Campsite.findByIdAndDelete(req.params.campsiteId)
      .then(response => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(response)
      })
      .catch(err => next(err))
  })


// http://localhost:3000/campsites/<campsiteId>/comments
campsiteRouter.route('/:campsiteId/comments')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
      .populate('comments.author')
      .then(campsite => {
        if (campsite) {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.json(campsite.comments)
        } else {
          err = new Error(`Campsite ${req.params.campsiteId} not found`)
          err.status = 404
          return next(err)
        }
      })
      .catch(err => next(err))
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
      .then(campsite => {
        if (campsite) {
          req.body.author = req.user._id // ensures that when the comment is saved, it will have the id of the user who submitted the comment in the author field so that later we can access it to populate this field
          campsite.comments.push(req.body)
          campsite.save()
            .then(campsite => {
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.json(campsite)
            })
            .catch(err => next(err))
        } else {
          err = new Error(`Campsite ${req.params.campsiteId} not found`)
          err.status = 404
          return next(err)
        }
      })
      .catch(err => next(err))
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403
    res.end(`PUT operation not supported on /campsites/${req.params.campsiteId}/comments`)
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
      .then(campsite => {
        if (campsite) {
          for (let i = campsite.comments.length - 1; i >= 0; i--) {
            campsite.comments.id(campsite.comments[i]._id).remove()
          }
          campsite.save()
            .then(campsite => {
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.json(campsite)
            })
            .catch(err => next(err))
        } else {
          err = new Error(`Campsite ${req.params.campsiteId} not found`)
          err.status = 404
          return next(err)
        }
      })
      .catch(err => next(err))
  })

// http://localhost:3000/campsites/<campsiteId>/comments/<commentId>
campsiteRouter.route('/:campsiteId/comments/:commentId')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
      .populate('comments.author')
      .then(campsite => {
        if (campsite && campsite.comments.id(req.params.commentId)) {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.json(campsite.comments.id(req.params.commentId))
        } else if (!campsite) {
          err = new Error(`Campsite ${req.params.campsiteId} not found`)
          err.status = 404
          return next(err)
        } else {
          err = new Error(`Comment ${req.params.commentId} not found`)
          err.status = 404
          return next(err)
        }
      })
      .catch(err => next(err))
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403
    res.end(`POST operation not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`)
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
      .then(campsite => {
        if (campsite && campsite.comments.id(req.params.commentId)) {
          if ((campsite.comments.id(req.params.commentId).author._id).equals(req.user.id)) {
            if (req.body.rating) {
              campsite.comments.id(req.params.commentId).rating = req.body.rating
            }
            if (req.body.text) {
              campsite.comments.id(req.params.commentId).text = req.body.text
            }
            campsite.save()
              .then(campsite => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(campsite)
              })
              .catch(err => next(err))
          } else {
            err = new Error('You are not authorized to edit this comment')
            err.status = 403
            return next(err)
          }
        } else if (!campsite) {
          err = new Error(`Campsite ${req.params.campsiteId} not found`)
          err.status = 404
          return next(err)
        } else {
          err = new Error(`Comment ${req.params.commentId} not found`)
          err.status = 404
          return next(err)
        }
      })
      .catch(err => next(err))
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
      .then(campsite => {
        if (campsite && campsite.comments.id(req.params.commentId)) {
          if ((campsite.comments.id(req.params.commentId).author._id).equals(req.user.id)) {
            campsite.comments.id(req.params.commentId).remove()
            campsite.save()
              .then(campsite => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(campsite)
              })
              .catch(err => next(err))
          } else {
            err = new Error('You are not authorized to delete this comment')
            err.status = 403
            return next(err)
          }
        } else if (!campsite) {
          err = new Error(`Campsite ${req.params.campsiteId} not found`)
          err.status = 404
          return next(err)
        } else {
          err = new Error(`Comment ${req.params.commentId} not found`)
          err.status = 404
          return next(err)
        }
      })
      .catch(err => next(err))
  })


module.exports = campsiteRouter
