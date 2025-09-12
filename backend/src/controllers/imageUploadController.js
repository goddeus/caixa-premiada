const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Configuração do multer para upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/images');
    
    // Criar diretório se não existir
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Gerar nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `prize-${uniqueSuffix}${ext}`);
  }
});

// Filtro para aceitar apenas imagens
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos de imagem são permitidos'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Middleware de upload
const uploadImage = upload.single('image');

// Controller para upload de imagem de prêmio
const uploadPrizeImage = async (req, res) => {
  try {
    const { prizeId } = req.body;
    
    if (!prizeId) {
      return res.status(400).json({ error: 'ID do prêmio é obrigatório' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
    }

    // Verificar se o prêmio existe
    const prize = await prisma.prize.findUnique({
      where: { id: prizeId }
    });

    if (!prize) {
      // Deletar arquivo se prêmio não existir
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Prêmio não encontrado' });
    }

    // Gerar caminho relativo para a imagem
    const imagePath = `/uploads/images/${req.file.filename}`;
    
    // Atualizar prêmio com nova imagem
    const updatedPrize = await prisma.prize.update({
      where: { id: prizeId },
      data: {
        imagem_id: imagePath,
        imagem_url: imagePath // Manter compatibilidade
      }
    });

    console.log(`Imagem enviada para prêmio ${prizeId}: ${imagePath}`);

    res.json({
      success: true,
      message: 'Imagem enviada com sucesso',
      imagePath: imagePath,
      prize: updatedPrize
    });

  } catch (error) {
    console.error('Erro ao enviar imagem:', error);
    
    // Deletar arquivo em caso de erro
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Erro ao deletar arquivo:', unlinkError);
      }
    }
    
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
};

// Controller para deletar imagem de prêmio
const deletePrizeImage = async (req, res) => {
  try {
    const { prizeId } = req.params;
    
    const prize = await prisma.prize.findUnique({
      where: { id: prizeId }
    });

    if (!prize) {
      return res.status(404).json({ error: 'Prêmio não encontrado' });
    }

    // Deletar arquivo físico se existir
    if (prize.imagem_id && prize.imagem_id.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '../../', prize.imagem_id);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (unlinkError) {
        console.error('Erro ao deletar arquivo físico:', unlinkError);
      }
    }

    // Atualizar prêmio removendo referência da imagem
    const updatedPrize = await prisma.prize.update({
      where: { id: prizeId },
      data: {
        imagem_id: '',
        imagem_url: null
      }
    });

    res.json({
      success: true,
      message: 'Imagem removida com sucesso',
      prize: updatedPrize
    });

  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
};

module.exports = {
  uploadImage,
  uploadPrizeImage,
  deletePrizeImage
};
