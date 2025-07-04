const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { authenticate, checkAgeRestriction } = require('../middlewares/auth');
const mediaController = require('../controllers/media.controller');

// Make sure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Define multer after ensuring the directory exists
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload only images.'), false);
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 } // Increased to 50MB
});

// Public routes (accessible to guests)
router.get('/', async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (authHeader) {
      authenticate(req, res, next);
    } else {
      next();
    }
  } catch (error) {
    next();
  }
}, mediaController.getAllMedia);

// Billboard routes
router.get('/billboard/current', mediaController.getCurrentBillboard); // Main billboard endpoint
// Specialized billboard routes with fallback to main endpoint
router.get('/billboard/movies', async (req, res) => {
  try {
    // Ensure mediaType is set to 'movie'
    req.query.mediaType = 'movie';
    return mediaController.getMovieBillboard(req, res);
  } catch (error) {
    console.error("Error in movie billboard route:", error);
    // Fallback to the main billboard with type filter
    req.query.mediaType = 'movie';
    return mediaController.getCurrentBillboard(req, res);
  }
});

router.get('/billboard/books', async (req, res) => {
  try {
    // Ensure mediaType is set to 'book'
    req.query.mediaType = 'book';
    return mediaController.getBookBillboard(req, res);
  } catch (error) {
    console.error("Error in book billboard route:", error);
    // Fallback to the main billboard with type filter
    req.query.mediaType = 'book';
    return mediaController.getCurrentBillboard(req, res);
  }
});

router.get('/billboard/search', mediaController.getBillboardByWeekAndYear);

// Filter route
router.get('/filter/:type', mediaController.filterMedia);

// Get by ID route 
router.get('/:id', mediaController.getMediaById);

// Protected routes (require authentication)
router.post('/', authenticate, upload.single('image'), mediaController.createMedia);
router.put('/:id', authenticate, upload.single('image'), mediaController.updateMedia);
router.delete('/:id', authenticate, mediaController.deleteMedia);
router.post('/:id/venues', authenticate, mediaController.addVenue);
router.post('/tickets/purchase', authenticate, mediaController.purchaseTicket);

module.exports = router;