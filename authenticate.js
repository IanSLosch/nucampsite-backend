const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('./models/user') // since created with the user schema, has access to the passport-local-mongoose plugin already
const JwtStrategy = require('passport-jwt').Strategy // jwt constructor
const ExtractJwt = require('passport-jwt').ExtractJwt // object that will provide various helper methods
const jwt = require('jsonwebtoken') // used to create, sign, and verify tokens 
const FacebookTokenStrategy = require('passport-facebook-token')

const config = require('./config.js')

exports.local = passport.use(new LocalStrategy(User.authenticate())) // adds the specific strategy plugin that we want to use to passport implementation (here it's 'localStrategy'). localStrategy reuires a callback function that will verify username and password against the locally stored username and passwords (we use authenticate() from passport-local-mongoose)
passport.serializeUser(User.serializeUser()) // this conversion needs to happen when we recieve data from the request object in order to store
passport.deserializeUser(User.deserializeUser())// when user is successfully verified, the user data has to be grabbed from the session and added to the request object. deserialization need to happen to do this

exports.getToken = function (user) { // user contains an ID for a user document
  return jwt.sign(user, config.secretKey, { expiresIn: 3600 }) // returns a token
}

const opts = {} // contains options for jwt strategy. the following lines set the options by seting properties for the opts object
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken() // specifies how the jwt should be extracted from the incoming request message. jwt can be sent in many ways: (header, body, urlquery parameter)
opts.secretOrKey = config.secretKey // supplies the jwt with secret key

exports.jwtPassport = passport.use( // this exports the jwt. (options (opts), verify callback function (this one is custom, but similar to authenticate()))
  new JwtStrategy(
    opts,
    (jwt_payload, done) => { // this verification is laid out in the documentation
      console.log('JWT payload:', jwt_payload)
      User.findOne({ _id: jwt_payload._id }, (err, user) => {
        if (err) {
          return done(err, false)
        } else if (user) {
          return done(null, user)
        } else {
          return done(null, false) // this would be a good spot the setup a promt to create a new user account
        }
      })
    }
  )
)

// this is just a shortcut to be able to authenticate with the jwt strategy. we can import and use this in other files

exports.verifyAdmin = (req, res, next) => {
  if (req.user.admin) {
    return next()
  } else {
    const err = new Error('You are not authorized to perform this operation!')
    res.status(403) // Corrected usage: res.status(403)
    return next(err)
  }
}

exports.verifyUser = passport.authenticate('jwt', { session: false })

exports.facebookPassport = passport.use(
  new FacebookTokenStrategy(
    {
      clientID: config.facebook.clientId,
      clientSecret: config.facebook.clientSecret
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({ facebookId: profile.id }, (err, user) => {
        if (err) {
          return done(err, false)
        }
        if (!err && user) {
          return done(null, user)
        } else {
          user = new User({ username: profile.displayName })
          user.facebookId = profile.id
          user.firstname = profile.name.givenName
          user.lastname = profile.name.familyName
          user.save((err, user) => {
            if (err) {
              return done(err, false)
            } else {
              return done(null, user)
            }
          })
        }
      })
    }
  )
)