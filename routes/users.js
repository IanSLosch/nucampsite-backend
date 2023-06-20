var express = require('express')
const User = require('../models/user')
const passport = require('passport') // provides methods useful for reqistering and logging in users
const authenticate = require('../authenticate')
const cors = require('./cors')

var router = express.Router()

// localhost:3000/users/
router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function (req, res, next) {
  User.find()
    .then((users) => {
      res.statusCode = 200
      res.setHeader('Content-Type, application/json')
      res.json(users)
    }).catch(err => next(err))
})

// localhost:3000/users/signup
router.post('/signup', cors.corsWithOptions, (req, res) => { //this is for when user wants to post new registration data
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    (err, user) => { // user object in this callback is optional 
      if (err) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.json({ err: err })
      } else {
        if (req.body.firstname) {
          user.firstname = req.body.firstname
        }
        if (req.body.lastname) {
          user.lastname = req.body.lastname
        }
        user.save(err => {
          if (err) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.json({ err: err })
            return
          }
          passport.authenticate('local')(req, res, () => {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.json({ success: true, status: 'Registration Successful!' })
          })
        })
      }
    }
  )
})

// localhost:3000/users/login
router.post('/login', cors.corsWithOptions, passport.authenticate('local'), (req, res) => { // passing passport.authenticate('local') as a second argument enables authentication on this route
  // passport.authenticate('local') takes care of all of the error handling and authentication. only need to return success case
  const token = authenticate.getToken({ _id: req.user._id })
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.json({ success: true, token: token, status: 'You are successfully logged in!' })
})

// localhost:3000/users/logout
router.get('/logout', cors.corsWithOptions, (req, res, next) => { // logouts user
  if (req.session) { // is there a session?
    req.session.destroy() // deletes the session
    res.clearCookie('session-id') // session-id was configured in the app.js file when the session was setup
    res.redirect('/') // redirects user to the root path
  } else {
    const err = new Error('You are not logged in!')
    err.status = 401
    return next(err)
  }
})

// localhost:3000/users/facebook/token
router.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
  if (req.user) {
      const token = authenticate.getToken({_id: req.user._id})
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.json({success: true, token: token, status: 'You are successfully logged in!'})
  }
})


module.exports = router
