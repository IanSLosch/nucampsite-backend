const express = require('express')
const Favorite = require('../models/favorite')
const authenticate = require('../authenticate')
const cors = require('./cors')

const favoriteRouter = express.Router()

// http://localhost:3000/favorites/
favoriteRouter.route('/')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
      .populate('user')
      .populate('campsites')
      .then(favorites => {
        console.log('*****' + favorites)
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(favorites)
      })
      .catch(err => next(err))
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then(favorites => {
        if (favorites) {
          req.body.forEach(campsiteId => {
            if (!favorites.campsites.includes(campsiteId._id)) {
              favorites.campsites.push(campsiteId._id)
            }
          })

          return favorites.save()
        } else {
          return Favorite.create({
            user: req.user._id,
            campsites: req.body
          })
        }
      })
      .then(updatedFavorite => {
        res.status(200).json(updatedFavorite)
      })
      .catch(err => next(err))
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403
    res.end('PUT operation not supported on /favorites')
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({ user: req.user._id })
      .then(favorites => {
        if (favorites) {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.json(favorites)
        } else {
          res.setHeader('Content-Type', 'text/plain')
          res.end('You do not have any favorites to delete')
        }
      })
      .catch(err => next(err))
  })

// http://localhost:3000/favorites/<campsiteId>
favoriteRouter.route('/:campsiteId')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403
    res.end('GET operation not supported on /favorites/:campsiteId')
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then(favorites => {
        if (favorites) {
          if (!favorites.campsites.includes(req.params.campsiteId)) {
            favorites.campsites.push(req.params.campsiteId)

            return favorites.save()
          } else {
            res.statusCode = 400
            res.end('That campsite is already in the list of favorites!')
          }
        } else {
          return Favorite.create({
            user: req.user._id,
            campsites: [req.params.campsiteId]
          })
        }
      })
      .catch(err => next(err))
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403
    res.end('PUT operation not supported on /favorites/:campsiteId')
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then(favorites => {
        if (favorites) {
          if (!favorites.campsites.includes(req.params.campsiteId)) {
            res.setHeader('Content-Type', 'text/plain')
            res.end('That campsite is not currently on the favorites list!')
          } else {
            favorites.campsites = favorites.campsites.filter(campsite => campsite !== req.params.campsiteId)

            return favorites.save()
          }
        } else {
          res.setHeader('Content-Type', 'text/plain')
          res.end('There are no campsites to delete!')
        }
      })
      .catch(err => next(err))
  })

module.exports = favoriteRouter