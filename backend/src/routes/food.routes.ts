import { Router } from 'express';
import { prisma } from '../db';

const router = Router();

// GET all food items (with optional search, category filter)
router.get('/', async (req, res) => {
  try {
    const { search, categoryId, isVeg, isAvailable } = req.query;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { description: { contains: String(search) } },
      ];
    }
    if (categoryId) {
      where.categoryId = String(categoryId);
    }
    if (isVeg !== undefined && isVeg !== '') {
      where.isVeg = isVeg === 'true';
    }
    if (isAvailable !== undefined && isAvailable !== '') {
      where.isAvailable = isAvailable === 'true';
    }

    const foodItems = await prisma.foodItem.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(foodItems);
  } catch (error) {
    console.error('Error fetching food items:', error);
    res.status(500).json({ error: 'Failed to fetch food items' });
  }
});

// GET categories
router.get('/categories', async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { foodItems: true },
        },
      },
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST create category
router.post('/categories', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const category = await prisma.category.create({
      data: { name, description },
    });
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// GET single food item
router.get('/:id', async (req, res) => {
  try {
    const foodItem = await prisma.foodItem.findUnique({
      where: { id: req.params.id },
      include: { category: true },
    });
    if (!foodItem) {
      return res.status(404).json({ error: 'Food item not found' });
    }
    res.json(foodItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch food item' });
  }
});

// POST create food item
router.post('/', async (req, res) => {
  try {
    const { name, categoryId, price, description, isVeg, imageUrl, isAvailable } = req.body;
    
    if (!name || !categoryId || price === undefined || price < 0) {
      return res.status(400).json({ error: 'Valid name, category, and non-negative price are required' });
    }

    const foodItem = await prisma.foodItem.create({
      data: {
        name,
        categoryId,
        price: parseFloat(price),
        description: description || '',
        isVeg: Boolean(isVeg),
        imageUrl: imageUrl || '',
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      },
      include: { category: true },
    });

    res.status(201).json(foodItem);
  } catch (error) {
    console.error('Error creating food item:', error);
    res.status(500).json({ error: 'Failed to create food item' });
  }
});

// PUT update food item
router.put('/:id', async (req, res) => {
  try {
    const { name, categoryId, price, description, isVeg, imageUrl, isAvailable } = req.body;

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (categoryId !== undefined) data.categoryId = categoryId;
    if (price !== undefined) data.price = parseFloat(price);
    if (description !== undefined) data.description = description;
    if (isVeg !== undefined) data.isVeg = Boolean(isVeg);
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    if (isAvailable !== undefined) data.isAvailable = Boolean(isAvailable);

    const foodItem = await prisma.foodItem.update({
      where: { id: req.params.id },
      data,
      include: { category: true },
    });

    res.json(foodItem);
  } catch (error) {
    console.error('Error updating food item:', error);
    res.status(500).json({ error: 'Failed to update food item' });
  }
});

// PATCH toggle food item availability
router.patch('/:id/toggle-availability', async (req, res) => {
  try {
    const existing = await prisma.foodItem.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    const updated = await prisma.foodItem.update({
      where: { id: req.params.id },
      data: { isAvailable: !existing.isAvailable },
      include: { category: true },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle availability' });
  }
});

// DELETE food item
router.delete('/:id', async (req, res) => {
  try {
    await prisma.foodItem.delete({ where: { id: req.params.id } });
    res.json({ message: 'Food item deleted successfully' });
  } catch (error) {
    console.error('Error deleting food item:', error);
    res.status(500).json({ error: 'Failed to delete food item' });
  }
});

export default router;
