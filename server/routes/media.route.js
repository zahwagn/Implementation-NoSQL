const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticate, requireLogin, checkAgeRestriction, checkCategoryAccess } = require('../middlewares/auth');
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

// READ untuk guest & user
router.get('/', authenticate, checkAgeRestriction, mediaController.getAllMedia);
router.get('/:id', authenticate, checkAgeRestriction, mediaController.getMediaById);
router.get('/filter/:type', authenticate, checkAgeRestriction, mediaController.filterMedia);
router.get('/billboard/current', authenticate, checkAgeRestriction, mediaController.getCurrentBillboard);
router.get('/category/:ageCategory', authenticate, checkAgeRestriction, mediaController.getMediaByAgeCategory);

// CREATE, UPDATE, DELETE operations hanya untuk user
router.post('/', authenticate, requireLogin, checkCategoryAccess, upload.single('image'), mediaController.createMedia);
router.put('/:id', authenticate, requireLogin, checkCategoryAccess, upload.single('image'), mediaController.updateMedia);
router.delete('/:id', authenticate, requireLogin, checkCategoryAccess, mediaController.deleteMedia);
router.post('/:id/venues', authenticate, requireLogin, checkCategoryAccess, mediaController.addVenue);
router.post('/:id/view', authenticate, requireLogin, checkAgeRestriction, mediaController.incrementViewCount);

module.exports = router;