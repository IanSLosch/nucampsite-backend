const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy 
const User = require('./models/user') // since created with the user schema, has access to the passport-local-mongoose plugin already

exports.local = passport.use(new LocalStrategy(User.authenticate())) // adds the specific strategy plugin that we want to use to passport implementation (here it's 'localStrategy'). localStrategy reuires a callback function that will verify username and password against the locally stored username and passwords (we use authenticate() from passport-local-mongoose)
passport.serializeUser(User.serializeUser()) // this conversion needs to happen when we recieve data from the request object in order to store
passport.deserializeUser(User.deserializeUser())// when user is successfully verified, the user data has to be grabbed from the session and added to the request object. deserialization need to happen to do this