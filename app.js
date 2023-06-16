var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
const session = require('express-session')
const FileStore = require('session-file-store')(session) // require('session-file-store) returns a function. when it does, we are immediately calling it passing it session
const passport = require('passport')
const authenticate = require('./authenticate') // authenticate.js

var indexRouter = require('./routes/index')
var usersRouter = require('./routes/users')

// route imports
const campsiteRouter = require('./routes/campsiteRouter')
const promotionRouter = require('./routes/promotionRouter')
const partnerRouter = require('./routes/partnerRouter')

const mongoose = require('mongoose')

const url = 'mongodb://localhost:27017/nucampsite'
const connect = mongoose.connect(url, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true
})

connect.then(() => console.log('Connected correctly to Server'),
  err => console.log(err) // another way to handle errors (this could also be a .catch)
)

var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// app.use(cookieParser('12345-67890-09876-54321')) // cryptographic key that is used by cookie parser to sign the information and encrypt it to send it to client

// session start
app.use(session({
  name: 'session-id',
  secret: '12345-67890-09876-54321',
  saveUninitialized: false, // when new sessions are mad ebut no updates are made to it, it won't get saved. helps prevent bloating of stored data
  resave: false, // once a sessions is created, updated and saved, it will continue to be resaved whenever a request is made for that session (even if no changes made) helps keeping the session marked as active so it doesn't get reset while user is using it
  store: new FileStore() //creates FileStore to save to the hard disk instead of just application memory
}))
//session end

app.use(passport.initialize()) // only necessary if you are using session based authenticaton. these are two middleware functions provided by passport. they check incoming requests to see if there is an existing session with that client. if so, session data is loading into request as req.user
app.use(passport.session())


app.use('/', indexRouter)
app.use('/users', usersRouter)

// add encrypted authentication using cookieParser
function auth(req, res, next) {
  console.log(req.user)

  if (!req.user) { // if there is no user at this point, there is no session because initialize() and session() would have added a req.user property
    const err = new Error('You are not authenticated!')
    err.status = 401
    return next(err) // passed to express error handler
  } else {
    return next()
  }
}

app.use(auth)
// end encrypted authentication using cookieParser

app.use(express.static(path.join(__dirname, 'public')))


// defines the url endpoint for the router
app.use('/campsites', campsiteRouter)
app.use('/promotions', promotionRouter)
app.use('/partners', partnerRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
