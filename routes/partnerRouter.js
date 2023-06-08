const express = require('express')
const partnerRouter = express.Router()

// http://localhost:3000/partners/
partnerRouter.route('/') // setup in server.js (this is a relative route)***
.all((req, res, next) => {
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/plain')
  next()
})
.get((req, res) => {
  res.end('Will send all the partners to you') // this will eventually be returning partner data
})
.post((req, res) => {
  res.end(`Will add the partner: ${req.body.name} with description: ${req.body.description}`)
})
.put((req, res) => {
  res.statusCode = 403
  res.end('PUT operation not supported on /partners')
})
.delete((req, res) => {
  res.end('Deleting all partners') // this should be restricted to certain users
})

// http://localhost:3000/partners/<id>
partnerRouter.route('/:partnerId') // setup in server.js ***
.all((req, res, next) => {
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/plain')
  next()
})
.get((req, res) => {
  res.end(`Will send details of the partner: ${req.params.partnerId} to you`)
})
.post((req, res) => {
  res.end(`POST operation not supported on /partners/${req.params.partnerId}`)
})
.put((req, res) => {
  res.statusCode = 403 
  res.end(`Will update the partner: ${req.body.name} with description: ${req.body.description}`)
})
.delete((req, res) => {
  res.end(`Deleting partner: ${req.params.partnerId}`)
})

module.exports = partnerRouter