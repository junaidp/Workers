import express from 'express';
import { prisma } from '../index.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.serviceCategory.findMany({
      where: { isActive: true },
      include: {
        services: {
          where: { 
            isActive: true,
            parentId: null
          },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    });

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Failed to get categories' });
  }
});

router.get('/category/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await prisma.serviceCategory.findUnique({
      where: { slug },
      include: {
        services: {
          where: { 
            isActive: true,
            parentId: null
          },
          include: {
            children: {
              where: { isActive: true },
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Failed to get category' });
  }
});

router.get('/service/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const service = await prisma.service.findUnique({
      where: { slug },
      include: {
        category: true,
        parent: true,
        children: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json(service);
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ message: 'Failed to get service' });
  }
});

router.get('/:serviceId/children', async (req, res) => {
  try {
    const { serviceId } = req.params;

    const children = await prisma.service.findMany({
      where: {
        parentId: serviceId,
        isActive: true
      },
      orderBy: { order: 'asc' }
    });

    res.json(children);
  } catch (error) {
    console.error('Get service children error:', error);
    res.status(500).json({ message: 'Failed to get service children' });
  }
});

router.post('/category', authenticate, authorize('ADMIN'), upload.single('image'), async (req: AuthRequest, res) => {
  try {
    const { name, slug, description, order } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const category = await prisma.serviceCategory.create({
      data: {
        name,
        slug,
        description,
        image,
        order: order ? parseInt(order) : 0
      }
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Failed to create category' });
  }
});

router.post('/service', authenticate, authorize('ADMIN'), upload.single('image'), async (req: AuthRequest, res) => {
  try {
    const { categoryId, name, slug, description, parentId, level, order } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const service = await prisma.service.create({
      data: {
        categoryId,
        name,
        slug,
        description,
        image,
        parentId: parentId || null,
        level: level ? parseInt(level) : 1,
        order: order ? parseInt(order) : 0
      }
    });

    res.status(201).json(service);
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ message: 'Failed to create service' });
  }
});

router.put('/category/:id', authenticate, authorize('ADMIN'), upload.single('image'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive, order } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive === 'true';
    if (order !== undefined) updateData.order = parseInt(order);
    if (image) updateData.image = image;

    const category = await prisma.serviceCategory.update({
      where: { id },
      data: updateData
    });

    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Failed to update category' });
  }
});

router.put('/service/:id', authenticate, authorize('ADMIN'), upload.single('image'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive, order } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive === 'true';
    if (order !== undefined) updateData.order = parseInt(order);
    if (image) updateData.image = image;

    const service = await prisma.service.update({
      where: { id },
      data: updateData
    });

    res.json(service);
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ message: 'Failed to update service' });
  }
});

export default router;
