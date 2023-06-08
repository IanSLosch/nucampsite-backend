const express = require('express')
const promotionRouter = express.Router()

// http://localhost:3000/promotions/
promotionRouter.route('/') // setup in server.js ***
.all((req, res, next) => {
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/plain')
  next()
})
.get((req, res) => {
  res.end('Will send all the promotions to you')
})
.post((req, res) => {
  res.end(`Will add the promotion: ${req.body.name} with description: ${req.body.description}`)
})
.put((req, res) => {
  res.statusCode = 403
  res.end('PUT operation not supported on /promotions')
})
.delete((req, res) => {
  res.end('Deleting all promotions')
})

// http://localhost:3000/promotions/<id>
promotionRouter.route('/:promotionId')
.all((req, res, next) => {
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/plain')
  next()
})
.get((req, res) => {
  res.end(`Will send details of the promotion: ${req.params.promotionId} to you`)
})
.post((req, res) => {
  res.end(`POST operation not supported on /promotions/${req.params.promotionId}`)
})
.put((req, res) => {
  res.statusCode = 403 
  res.end(`Will update the promotion: ${req.body.name} with description: ${req.body.description}`)
})
.delete((req, res) => {
  res.end(`Deleting promotion: ${req.params.promotionId}`)
})

module.exports = promotionRouter