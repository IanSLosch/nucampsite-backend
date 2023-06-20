const express = require('express');
const authenticate = require('../authenticate');
const multer = require('multer');

// multer does have default fallback configurations. below is an example of custom configuration

const storage = multer.diskStorage({
    destination: (req, file, cb) => { // 'cb' stands for 'callback' // destination is letting you choose the files destination
        cb(null, 'public/images'); // cb(<error handle (null check)>, <path you want to save file to>) // public/images will let it be accesed as a static file from the outside
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname) // guarentees the name of the file on the server is the name of the file on the client side // multer by default will name the file a random string
    }
});

const imageFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) { // this regex will filter out all files that don't have the proper file type
        return cb(new Error('You can upload only image files!'), false); // cb(<error handling>, < tells multer to reject this file uplaod>)
    }
    cb(null, true); // says cb(<no error>, <accept file>)
};

const upload = multer({ storage: storage, fileFilter: imageFileFilter}); // calls multer and passes configurations above

const uploadRouter = express.Router();

uploadRouter.route('/')
.get(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload');
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => { // upload.single('imageFile') says that we are aexpecting a single file upload with with the imput field name of 'imageFile'. multer will process the file and continue on to res.status code
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(req.file);
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /imageUpload');
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('DELETE operation not supported on /imageUpload');
});

module.exports = uploadRouter;