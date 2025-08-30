const express = require('express');
const { body, validationResult } = require('express-validator');
const { verifyToken } = require('../middleware/auth');
const { asyncHandler, createError } = require('../middleware/errorHandler');
const supabase = require('../config/supabase');

const router = express.Router();

/**
 * Validações para criação/atualização de produto
 */
const productValidation = [
  body('name')
    .notEmpty()
    .withMessage('Nome do produto é obrigatório')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('description')
    .notEmpty()
    .withMessage('Descrição é obrigatória')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Descrição deve ter entre 10 e 500 caracteres'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Preço deve ser um número positivo'),
  body('category')
    .notEmpty()
    .withMessage('Categoria é obrigatória')
    .trim(),
  body('barcode')
    .notEmpty()
    .withMessage('Código de barras é obrigatório')
    .trim(),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Estoque deve ser um número inteiro positivo'),
  body('isSoldByWeight')
    .isBoolean()
    .withMessage('isSoldByWeight deve ser um booleano'),
  body('pricePerKg')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Preço por kg deve ser um número positivo'),
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('URL da imagem deve ser válida'),
];

/**
 * POST /api/products
 * Criar novo produto (apenas vendedores)
 */
router.post('/', verifyToken, productValidation, asyncHandler(async (req, res) => {
  console.log('🛍️ [PRODUCTS/CREATE] Iniciando criação de produto');
  console.log('📝 [PRODUCTS/CREATE] Dados recebidos:', JSON.stringify(req.body, null, 2));
  
  // Verificar se o usuário é vendedor
  if (!req.user.isSeller) {
    console.log('❌ [PRODUCTS/CREATE] Usuário não é vendedor:', req.user.id);
    throw createError('Apenas vendedores podem criar produtos', 403);
  }

  // Verificar erros de validação
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ [PRODUCTS/CREATE] Erros de validação:', errors.array());
    return res.status(400).json({
      error: 'Dados inválidos',
      details: errors.array()
    });
  }

  const {
    name,
    description,
    price,
    category,
    barcode,
    stock,
    isSoldByWeight,
    pricePerKg,
    imageUrl,
    isAvailable = true
  } = req.body;

  try {
    // Se não houver Supabase configurado, usar mock temporário
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
      console.log('✅ [PRODUCTS/CREATE] Usando mock temporário para teste (sem Supabase)');
      const newProductId = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newProduct = {
        id: newProductId,
        name,
        description,
        price: isSoldByWeight ? 0 : price,
        category,
        barcode,
        stock: isSoldByWeight ? 0 : stock,
        isSoldByWeight,
        pricePerKg: isSoldByWeight ? pricePerKg : null,
        imageUrl: imageUrl || 'https://via.placeholder.com/500x500.png?text=Product+Image',
        isAvailable,
        sellerId: req.user.id,
        rating: 0,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return res.status(201).json({
        message: 'Produto criado com sucesso (mock)',
        product: newProduct
      });
    }

    // Verificar se o código de barras já existe para este vendedor
    const { data: dup, error: dupError } = await supabase
      .from('products')
      .select('id, name')
      .eq('barcode', barcode)
      .eq('seller_id', req.user.id)
      .maybeSingle();

    if (dupError && dupError.code !== 'PGRST116') {
      console.error('❌ [PRODUCTS/CREATE] Erro ao verificar código de barras:', dupError);
      throw createError('Erro ao verificar código de barras', 500);
    }
    if (dup) {
      console.log('❌ [PRODUCTS/CREATE] Código de barras já existe:', barcode);
      return res.status(409).json({
        error: 'Código de barras duplicado',
        message: `Este código de barras já está em uso pelo produto: ${dup.name}`
      });
    }

    // Inserir produto no Supabase
    console.log('📦 [PRODUCTS/CREATE] Inserindo produto no banco...');
    const insertData = {
      name,
      description,
      price: isSoldByWeight ? 0 : price,
      category,
      barcode,
      stock: isSoldByWeight ? 0 : stock,
      is_sold_by_weight: isSoldByWeight,
      price_per_kg: isSoldByWeight ? pricePerKg : null,
      image_url: imageUrl || null,
      is_available: isAvailable,
      seller_id: req.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: created, error: insertError } = await supabase
      .from('products')
      .insert([insertData])
      .select()
      .single();

    if (insertError) {
      console.error('❌ [PRODUCTS/CREATE] Erro ao criar produto:', insertError);
      throw createError('Erro ao criar produto no banco de dados', 500);
    }

    console.log('✅ [PRODUCTS/CREATE] Produto criado com sucesso:', created.id);
    res.status(201).json({
      message: 'Produto criado com sucesso',
      product: {
        id: created.id,
        name: created.name,
        description: created.description,
        price: created.price,
        category: created.category,
        barcode: created.barcode,
        stock: created.stock,
        isSoldByWeight: created.is_sold_by_weight,
        pricePerKg: created.price_per_kg,
        imageUrl: created.image_url,
        isAvailable: created.is_available,
        sellerId: created.seller_id,
        createdAt: created.created_at,
        updatedAt: created.updated_at
      }
    });
  } catch (error) {
    console.error('💥 [PRODUCTS/CREATE] ERRO CRÍTICO:', error);
    throw error;
  }
}));

/**
 * GET /api/products
 * Listar produtos do vendedor
 */
router.get('/', verifyToken, asyncHandler(async (req, res) => {
  console.log('📋 [PRODUCTS/LIST] Listando produtos do vendedor:', req.user.id);
  
  // Verificar se o usuário é vendedor
  if (!req.user.isSeller) {
    console.log('❌ [PRODUCTS/LIST] Usuário não é vendedor:', req.user.id);
    throw createError('Apenas vendedores podem listar produtos', 403);
  }

  try {
    // Mock temporário para teste local
    console.log('✅ [PRODUCTS/LIST] Usando mock temporário para teste');
    
    const mockProducts = [
      {
        id: 'prod_001',
        name: 'Maçã Fuji',
        description: 'Maçãs frescas e doces, ideais para consumo in natura',
        price: 8.90,
        category: 'Frutas e Verduras',
        barcode: '7891234567890',
        stock: 50,
        isSoldByWeight: false,
        pricePerKg: null,
        imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
        isAvailable: true,
        sellerId: req.user.id,
        rating: 4.5,
        reviewCount: 12,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'prod_002',
        name: 'Banana Prata',
        description: 'Bananas prata maduras e saborosas',
        price: 4.50,
        category: 'Frutas e Verduras',
        barcode: '7891234567891',
        stock: 30,
        isSoldByWeight: false,
        pricePerKg: null,
        imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400',
        isAvailable: true,
        sellerId: req.user.id,
        rating: 4.2,
        reviewCount: 8,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    console.log('✅ [PRODUCTS/LIST] Produtos encontrados:', mockProducts.length);

    res.status(200).json({
      message: 'Produtos listados com sucesso',
      products: mockProducts,
      total: mockProducts.length
    });
  } catch (error) {
    console.error('💥 [PRODUCTS/LIST] ERRO CRÍTICO:', error);
    throw error;
  }
}));

/**
 * GET /api/products/:id
 * Obter produto específico
 */
router.get('/:id', verifyToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log('🔍 [PRODUCTS/GET] Buscando produto:', id);
  
  // Verificar se o usuário é vendedor
  if (!req.user.isSeller) {
    console.log('❌ [PRODUCTS/GET] Usuário não é vendedor:', req.user.id);
    throw createError('Apenas vendedores podem acessar produtos', 403);
  }

  try {
    // Mock temporário para ambiente sem Supabase
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
      console.log('✅ [PRODUCTS/GET] Usando mock temporário para teste (sem Supabase)');
      const mockProduct = {
        id,
        name: 'Produto Mock',
        description: 'Descrição mockada para testes locais',
        price: 9.99,
        category: 'Outros',
        barcode: '0000000000000',
        stock: 10,
        isSoldByWeight: false,
        pricePerKg: null,
        imageUrl: null,
        isAvailable: true,
        sellerId: req.user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return res.status(200).json({
        message: 'Produto encontrado (mock)',
        product: mockProduct
      });
    }

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('seller_id', req.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('❌ [PRODUCTS/GET] Produto não encontrado:', id);
        throw createError('Produto não encontrado', 404);
      }
      console.error('❌ [PRODUCTS/GET] Erro ao buscar produto:', error);
      throw createError('Erro ao buscar produto', 500);
    }

    console.log('✅ [PRODUCTS/GET] Produto encontrado:', product.id);
    
    res.status(200).json({
      message: 'Produto encontrado',
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        barcode: product.barcode,
        stock: product.stock,
        isSoldByWeight: product.is_sold_by_weight,
        pricePerKg: product.price_per_kg,
        imageUrl: product.image_url,
        isAvailable: product.is_available,
        sellerId: product.seller_id,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      }
    });
  } catch (error) {
    console.error('💥 [PRODUCTS/GET] ERRO CRÍTICO:', error);
    throw error;
  }
}));

/**
 * PUT /api/products/:id
 * Atualizar produto
 */
router.put('/:id', verifyToken, productValidation, asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log('🔄 [PRODUCTS/UPDATE] Atualizando produto:', id);
  console.log('📝 [PRODUCTS/UPDATE] Dados recebidos:', JSON.stringify(req.body, null, 2));
  
  // Verificar se o usuário é vendedor
  if (!req.user.isSeller) {
    console.log('❌ [PRODUCTS/UPDATE] Usuário não é vendedor:', req.user.id);
    throw createError('Apenas vendedores podem atualizar produtos', 403);
  }

  // Verificar erros de validação
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ [PRODUCTS/UPDATE] Erros de validação:', errors.array());
    return res.status(400).json({
      error: 'Dados inválidos',
      details: errors.array()
    });
  }

  const {
    name,
    description,
    price,
    category,
    barcode,
    stock,
    isSoldByWeight,
    pricePerKg,
    imageUrl,
    isAvailable
  } = req.body;

  try {
    // Mock temporário para ambiente sem Supabase
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
      console.log('✅ [PRODUCTS/UPDATE] Usando mock temporário para teste (sem Supabase)');
      const updatedProduct = {
        id,
        name,
        description,
        price: isSoldByWeight ? 0 : price,
        category,
        barcode,
        stock: isSoldByWeight ? 0 : stock,
        isSoldByWeight,
        pricePerKg: isSoldByWeight ? pricePerKg : null,
        imageUrl: imageUrl || null,
        isAvailable,
        sellerId: req.user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return res.status(200).json({
        message: 'Produto atualizado com sucesso (mock)',
        product: updatedProduct
      });
    }

    // Verificar se o produto existe e pertence ao vendedor
    const { data: existingProduct, error: checkError } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .eq('seller_id', req.user.id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        console.log('❌ [PRODUCTS/UPDATE] Produto não encontrado:', id);
        throw createError('Produto não encontrado', 404);
      }
      console.error('❌ [PRODUCTS/UPDATE] Erro ao verificar produto:', checkError);
      throw createError('Erro ao verificar produto', 500);
    }

    // Verificar se o código de barras já existe em outro produto
    const { data: duplicateBarcode, error: barcodeError } = await supabase
      .from('products')
      .select('id, name')
      .eq('barcode', barcode)
      .eq('seller_id', req.user.id)
      .neq('id', id)
      .single();

    if (barcodeError && barcodeError.code !== 'PGRST116') {
      console.error('❌ [PRODUCTS/UPDATE] Erro ao verificar código de barras:', barcodeError);
      throw createError('Erro ao verificar código de barras', 500);
    }

    if (duplicateBarcode) {
      console.log('❌ [PRODUCTS/UPDATE] Código de barras duplicado:', barcode);
      return res.status(409).json({
        error: 'Código de barras duplicado',
        message: `Este código de barras já está em uso pelo produto: ${duplicateBarcode.name}`
      });
    }

    // Atualizar o produto
    console.log('📦 [PRODUCTS/UPDATE] Atualizando produto no banco...');
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update({
        name,
        description,
        price: isSoldByWeight ? 0 : price,
        category,
        barcode,
        stock: isSoldByWeight ? 0 : stock,
        is_sold_by_weight: isSoldByWeight,
        price_per_kg: isSoldByWeight ? pricePerKg : null,
        image_url: imageUrl || null,
        is_available: isAvailable,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('seller_id', req.user.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ [PRODUCTS/UPDATE] Erro ao atualizar produto:', updateError);
      throw createError('Erro ao atualizar produto no banco de dados', 500);
    }

    console.log('✅ [PRODUCTS/UPDATE] Produto atualizado com sucesso:', updatedProduct.id);
    
    res.status(200).json({
      message: 'Produto atualizado com sucesso',
      product: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        description: updatedProduct.description,
        price: updatedProduct.price,
        category: updatedProduct.category,
        barcode: updatedProduct.barcode,
        stock: updatedProduct.stock,
        isSoldByWeight: updatedProduct.is_sold_by_weight,
        pricePerKg: updatedProduct.price_per_kg,
        imageUrl: updatedProduct.image_url,
        isAvailable: updatedProduct.is_available,
        sellerId: updatedProduct.seller_id,
        createdAt: updatedProduct.created_at,
        updatedAt: updatedProduct.updated_at
      }
    });
  } catch (error) {
    console.error('💥 [PRODUCTS/UPDATE] ERRO CRÍTICO:', error);
    throw error;
  }
}));

/**
 * DELETE /api/products/:id
 * Deletar produto
 */
router.delete('/:id', verifyToken, asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log('🗑️ [PRODUCTS/DELETE] Deletando produto:', id);
  
  // Verificar se o usuário é vendedor
  if (!req.user.isSeller) {
    console.log('❌ [PRODUCTS/DELETE] Usuário não é vendedor:', req.user.id);
    throw createError('Apenas vendedores podem deletar produtos', 403);
  }

  try {
    // Verificar se o produto existe e pertence ao vendedor
    const { data: existingProduct, error: checkError } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .eq('seller_id', req.user.id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        console.log('❌ [PRODUCTS/DELETE] Produto não encontrado:', id);
        throw createError('Produto não encontrado', 404);
      }
      console.error('❌ [PRODUCTS/DELETE] Erro ao verificar produto:', checkError);
      throw createError('Erro ao verificar produto', 500);
    }

    // Deletar o produto
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('seller_id', req.user.id);

    if (deleteError) {
      console.error('❌ [PRODUCTS/DELETE] Erro ao deletar produto:', deleteError);
      throw createError('Erro ao deletar produto do banco de dados', 500);
    }

    console.log('✅ [PRODUCTS/DELETE] Produto deletado com sucesso:', id);
    
    res.status(200).json({
      message: 'Produto deletado com sucesso',
      productId: id
    });
  } catch (error) {
    console.error('💥 [PRODUCTS/DELETE] ERRO CRÍTICO:', error);
    throw error;
  }
}));

/**
 * GET /api/products/barcode/:barcode
 * Buscar produto por código de barras
 */
router.get('/barcode/:barcode', verifyToken, asyncHandler(async (req, res) => {
  const { barcode } = req.params;
  console.log('🔍 [PRODUCTS/BARCODE] Buscando produto por código de barras:', barcode);
  
  // Verificar se o usuário é vendedor
  if (!req.user.isSeller) {
    console.log('❌ [PRODUCTS/BARCODE] Usuário não é vendedor:', req.user.id);
    throw createError('Apenas vendedores podem buscar produtos', 403);
  }

  try {
    // Mock temporário para teste local
    console.log('✅ [PRODUCTS/BARCODE] Usando mock temporário para teste');
    
    // Verificar se o código de barras já existe (mock)
    const mockExistingProducts = [
      { id: 'prod_001', barcode: '7891234567890', name: 'Maçã Fuji' },
      { id: 'prod_002', barcode: '7891234567891', name: 'Banana Prata' }
    ];
    
    const existingProduct = mockExistingProducts.find(product => 
      product.barcode === barcode
    );

    if (existingProduct) {
      console.log('❌ [PRODUCTS/BARCODE] Código de barras já existe:', barcode);
      return res.status(200).json({
        message: 'Código de barras já existe',
        available: false,
        product: {
          id: existingProduct.id,
          name: existingProduct.name,
          barcode: existingProduct.barcode
        }
      });
    }

    console.log('✅ [PRODUCTS/BARCODE] Código de barras disponível:', barcode);
    return res.status(200).json({
      message: 'Código de barras disponível',
      available: true
    });
  } catch (error) {
    console.error('💥 [PRODUCTS/BARCODE] ERRO CRÍTICO:', error);
    throw error;
  }
}));

module.exports = router;
