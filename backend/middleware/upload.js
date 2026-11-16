const multer = require('multer');
const path = require('path');
const fs = require('fs');

let upload;

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

try {
  const cloudinary = require('cloudinary').v2;
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name') {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    const storage = new CloudinaryStorage({
      cloudinary,
      params: {
        folder: 'electrical-hardware-shop',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 800, height: 800, crop: 'limit' }]
      }
    });

    upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
    console.log('Using Cloudinary storage');
  } else {
    throw new Error('Cloudinary not configured');
  }
} catch (e) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });
  upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
  console.log('Using local disk storage (uploads/)');
}

const cloudinary = { config: () => {} };

module.exports = { upload, cloudinary };
