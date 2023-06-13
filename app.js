var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')


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
app.use(cookieParser())

// add basic authentication here
function auth(req, res, next) {
  console.log(req.headers)
  const authHeader = req.headers.authorization
  if (!authHeader) { // no username and pass info
      const err = new Error('You are not authenticated!')
      res.setHeader('WWW-Authenticate', 'Basic') // lets client know the server is requesting basic authenitcation
      err.status = 401
      return next(err) // passed to express error handler
  }

  const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':') // Buffer is a global class in node. has a static method 'from'
  const user = auth[0] // grabs username from 'auth' array created above
  const pass = auth[1] // grabs password from 'auth' array created above
  if (user === 'admin' && pass === 'password') {
      return next() // authorized
  } else {
      const err = new Error('You are not authenticated!')
      res.setHeader('WWW-Authenticate', 'Basic')      
      err.status = 401
      return next(err) // passed to express error handler
  }
}

app.use(auth)
// end basic authentication

app.use(express.static(path.join(__dirname, 'public')))


// defines the url endpoint for the router
app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/campsites', campsiteRouter)
app.use('/promotions', promotionRouter)
app.use('/partners', partnerRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404))
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
