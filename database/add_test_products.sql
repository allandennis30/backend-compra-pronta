-- Script para adicionar produtos de teste
-- Execute este script após criar o sistema de produtos

-- Inserir produtos de teste para o vendedor
INSERT INTO products (
    name,
    description,
    price,
    category,
    barcode,
    stock,
    is_sold_by_weight,
    price_per_kg,
    image_url,
    is_available,
    seller_id,
    created_at,
    updated_at
) VALUES 
(
    'Maçã Fuji',
    'Maçãs frescas e doces, ideais para consumo in natura',
    8.90,
    'Frutas e Verduras',
    '7891234567890',
    50,
    false,
    null,
    'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
    true,
    (SELECT id FROM users WHERE is_seller = true LIMIT 1),
    NOW(),
    NOW()
),
(
    'Banana Prata',
    'Bananas prata maduras e saborosas',
    4.50,
    'Frutas e Verduras',
    '7891234567891',
    30,
    false,
    null,
    'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400',
    true,
    (SELECT id FROM users WHERE is_seller = true LIMIT 1),
    NOW(),
    NOW()
),
(
    'Leite Integral',
    'Leite integral fresco, 1L',
    6.90,
    'Laticínios',
    '7891234567892',
    25,
    false,
    null,
    'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400',
    true,
    (SELECT id FROM users WHERE is_seller = true LIMIT 1),
    NOW(),
    NOW()
),
(
    'Pão Francês',
    'Pão francês fresco, 500g',
    3.50,
    'Pães e Massas',
    '7891234567893',
    40,
    false,
    null,
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
    true,
    (SELECT id FROM users WHERE is_seller = true LIMIT 1),
    NOW(),
    NOW()
),
(
    'Coca-Cola',
    'Refrigerante Coca-Cola, 2L',
    8.50,
    'Bebidas',
    '7891234567894',
    35,
    false,
    null,
    'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400',
    true,
    (SELECT id FROM users WHERE is_seller = true LIMIT 1),
    NOW(),
    NOW()
);

-- Verificar se os produtos foram inseridos
SELECT 
    p.id,
    p.name,
    p.category,
    p.price,
    p.stock,
    p.is_available,
    u.nome as seller_name
FROM products p
JOIN users u ON p.seller_id = u.id
ORDER BY p.created_at DESC;

-- Verificar se os IDs foram adicionados ao usuário
SELECT 
    u.id,
    u.nome,
    u.products_ids,
    array_length(u.products_ids, 1) as total_products
FROM users u
WHERE is_seller = true;
