const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticate, authorize, checkAgeRestriction } = require('../middlewares/auth');
const mediaController = require('../controllers/media.controller');

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
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Routes to API
router.get('/', mediaController.getAllMedia);
router.get('/:id', mediaController.getMediaById);
router.get('/filter/:type', mediaController.filterMedia);
router.post('/', authenticate, upload.single('image'), mediaController.createMedia);
router.put('/:id', authenticate, upload.single('image'), mediaController.updateMedia);
router.delete('/:id', authenticate, mediaController.deleteMedia);
router.get('/billboard/current', mediaController.getCurrentBillboard);
router.put('/:id/view', mediaController.incrementViewCount);
router.post('/:id/venues', authenticate, mediaController.addVenue);
router.get('/age/:ageCategory', mediaController.getMediaByAgeCategory);
router.get('/', authenticate, checkAgeRestriction, mediaController.getAllMedia);
router.get('/:id', authenticate, checkAgeRestriction, mediaController.getMediaById);
router.get('/filter/:type', authenticate, checkAgeRestriction, mediaController.filterMedia);

module.exports = router;