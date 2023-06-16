var express = require('express')
const User = require('../models/user')
const passport = require('passport') // provides methods useful for reqistering and logging in users

var router = express.Router()

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource')
})

router.post('/signup', (req, res) => { //this is for when user wants to post new registration data
  User.register(
    new User({username: req.body.username}),
    req.body.password,
    err => {
      if (err) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.json({err: err})
      } else {
        passport.authenticate('local')(req,res, () => {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.json({success: true, status: 'Registration Successful!'})
        })
      }
    }
  )
})

router.post('/login', passport.authenticate('local'), (req, res) => { // passing passport.authenticate('local') as a second argument enables authentication on this route
  // passport.authenticate('local') takes care of all of the error handling and authentication. only need to return success case
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.json({success: true, status: 'You are successfully logged in!'})
})

router.get('/logout', (req, res, next) => { // logouts user
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

module.exports = router
