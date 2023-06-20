const cors = require('cors')

const whitelist = ['http://localhost:3000', 'https://localhost:3443']
const corsOptionsDelegate = (req, callback) => {
    let corsOptions
    console.log(req.header('Origin'))
    if(whitelist.indexOf(req.header('Origin')) !== -1) { // if -1, means item not found
        corsOptions = { origin: true } // allows request to be accepted
    } else {
        corsOptions = { origin: false } // request rejected
    }
    callback(null, corsOptions) // no error, pass back options
};

exports.cors = cors() // returns a middleware function configured to set a coors header of "Access-Control-Allow-Origin" on our response object with a wildcard as it's value. meaning it allows cors for all origins // used on endpoints we want to accept all cross origin requests
exports.corsWithOptions = cors(corsOptionsDelegate) // checks to see if one of the requests belongs to a whitelisted origin (above) // used on endpoints wher ewe only want to accept requests from whitelisted origins
