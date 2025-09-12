const express = require('express');
const router = express.Router();
const imageUploadController = require('../controllers/imageUploadController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);
router.use(requireAdmin);

// Upload de imagem de prêmio
router.post('/premios/upload-image', 
  imageUploadController.uploadImage,
  imageUploadController.uploadPrizeImage
);

// Deletar imagem de prêmio
router.delete('/premios/:prizeId/image', 
  imageUploadController.deletePrizeImage
);

module.exports = router;
