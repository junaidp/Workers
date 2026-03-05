import express from 'express';
import { prisma } from '../index.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { generateTradesmanId } from '../utils/idGenerator.js';
import { validateCNIC, validatePakistanMobile } from '../utils/validation.js';
import { sendEmail, sendWhatsApp } from '../utils/notifications.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.post('/register', upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'cnicImage', maxCount: 1 },
  { name: 'proofOfAddress', maxCount: 1 },
  { name: 'tradeLicense', maxCount: 1 },
  { name: 'portfolioImages', maxCount: 10 },
  { name: 'certifications', maxCount: 5 }
]), async (req, res) => {
  try {
    console.log('🔄 Tradesman registration started');
    
    const {
      firstName,
      lastName,
      email,
      businessName,
      buildingNumber,
      street,
      town,
      city,
      country,
      description,
      whatsapp,
      mobile,
      landline,
      cnicNumber,
      serviceIds,
      certificationTitles
    } = req.body;

    console.log('📝 Request data received:', { firstName, lastName, email, businessName, mobile });

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    console.log('📁 Files received:', Object.keys(files || {}));

    if (!firstName || !lastName || !businessName || !town || !city || !description || 
        !whatsapp || !mobile || !cnicNumber || !files.profilePicture || 
        !files.cnicImage || !files.proofOfAddress) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!validatePakistanMobile(mobile)) {
      return res.status(400).json({ message: 'Invalid mobile number format' });
    }

    if (!validateCNIC(cnicNumber)) {
      return res.status(400).json({ message: 'Invalid CNIC format' });
    }

    console.log('✅ Validation passed');

    const existingUser = await prisma.user.findFirst({
      where: { 
        OR: [
          { mobile },
          ...(email ? [{ email }] : [])
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this mobile or email' });
    }

    console.log('👤 Creating user...');
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: email || null,
        mobile,
        whatsapp: whatsapp || mobile,
        role: 'TRADESMAN',
        countryCode: '+92'
      }
    });

    console.log('✅ User created:', user.id);

    const businessAddress = [buildingNumber, street, town, city, country || 'Pakistan']
      .filter(Boolean)
      .join(', ');

    console.log('🏢 Creating tradesman profile...');
    const tradesman = await prisma.tradesman.create({
      data: {
        userId: user.id,
        tradesmanId: 'PENDING',
        businessName,
        businessAddress,
        buildingNumber: buildingNumber || '',
        street: street || '',
        town,
        city,
        country: country || 'Pakistan',
        description,
        cnicNumber: cnicNumber.replace(/-/g, ''),
        cnicImage: `/uploads/${files.cnicImage[0].filename}`,
        proofOfAddress: `/uploads/${files.proofOfAddress[0].filename}`,
        profilePicture: `/uploads/${files.profilePicture[0].filename}`,
        tradeLicense: files.tradeLicense ? `/uploads/${files.tradeLicense[0].filename}` : null,
        landline: landline || null,
        verificationStatus: 'PENDING',
        isApproved: false,
        services: {
          create: (Array.isArray(serviceIds) ? serviceIds : JSON.parse(serviceIds || '[]')).map((serviceId: string) => ({
            serviceId
          }))
        }
      }
    });

    console.log('✅ Tradesman created:', tradesman.id);

    if (files.portfolioImages) {
      await prisma.portfolioImage.createMany({
        data: files.portfolioImages.map(file => ({
          tradesmanId: tradesman.id,
          imageUrl: `/uploads/${file.filename}`
        }))
      });
    }

    if (files.certifications && certificationTitles) {
      const titles = Array.isArray(certificationTitles) ? certificationTitles : JSON.parse(certificationTitles || '[]');
      await prisma.certification.createMany({
        data: files.certifications.map((file, index) => ({
          tradesmanId: tradesman.id,
          title: titles[index] || 'Certification',
          imageUrl: `/uploads/${file.filename}`
        }))
      });
    }

    const verificationToken = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token: verificationToken,
        type: 'whatsapp',
        expiresAt
      }
    });

    const whatsappVerificationLink = `${process.env.FRONTEND_URL}/verify?token=${verificationToken}&type=whatsapp`;
    
    // Send WhatsApp asynchronously (don't wait for it)
    sendWhatsApp(user.whatsapp!, `Welcome! Verify your account: ${whatsappVerificationLink}`).catch(console.error);

    if (email) {
      const emailVerificationToken = uuidv4();
      await prisma.verificationToken.create({
        data: {
          userId: user.id,
          token: emailVerificationToken,
          type: 'email',
          expiresAt
        }
      });
      
      // Send email asynchronously (don't wait for it)
      sendEmail(email, 'Verify Your Email', `Click to verify: ${process.env.FRONTEND_URL}/verify?token=${emailVerificationToken}&type=email`).catch(console.error);
    }

    const admins = await prisma.admin.findMany({
      include: { user: true }
    });

    // Send admin notifications asynchronously
    for (const admin of admins) {
      if (admin.user.email) {
        sendEmail(
          admin.user.email,
          'New Tradesman Registration',
          `New tradesman registration pending approval: ${businessName}`
        ).catch(console.error);
      }
    }

    console.log('📧 Notifications sent, sending response...');
    res.status(201).json({
      message: 'Registration submitted successfully. Please verify your account and wait for admin approval.',
      userId: user.id
    });
    
    console.log('✅ Registration completed successfully');
  } catch (error) {
    console.error('Tradesman registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { city, serviceId, page = 1, limit = 12 } = req.query;

    const where: any = {
      isApproved: true,
      isVisible: true,
      verificationStatus: 'VERIFIED'
    };

    if (city) {
      where.city = city as string;
    }

    if (serviceId) {
      where.services = {
        some: {
          serviceId: serviceId as string
        }
      };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [tradesmen, total] = await Promise.all([
      prisma.tradesman.findMany({
        where,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          services: {
            include: {
              service: {
                include: {
                  category: true
                }
              }
            }
          },
          portfolioImages: {
            take: 3
          },
          reviews: {
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        },
        skip,
        take: Number(limit),
        orderBy: [
          { rating: 'desc' },
          { reviewCount: 'desc' }
        ]
      }),
      prisma.tradesman.count({ where })
    ]);

    res.json({
      tradesmen,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    console.error('Search tradesmen error:', error);
    res.status(500).json({ message: 'Search failed' });
  }
});

router.get('/:tradesmanId', async (req, res) => {
  try {
    const { tradesmanId } = req.params;

    const tradesman = await prisma.tradesman.findUnique({
      where: { tradesmanId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        services: {
          include: {
            service: {
              include: {
                category: true
              }
            }
          }
        },
        portfolioImages: true,
        certifications: true,
        reviews: {
          include: {
            customer: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!tradesman) {
      return res.status(404).json({ message: 'Tradesman not found' });
    }

    if (!tradesman.isVisible || !tradesman.isApproved) {
      return res.status(404).json({ message: 'Tradesman not available' });
    }

    res.json(tradesman);
  } catch (error) {
    console.error('Get tradesman error:', error);
    res.status(500).json({ message: 'Failed to get tradesman' });
  }
});

router.get('/dashboard/jobs', authenticate, authorize('TRADESMAN'), async (req: AuthRequest, res) => {
  try {
    const tradesman = await prisma.tradesman.findUnique({
      where: { userId: req.user!.userId }
    });

    if (!tradesman) {
      return res.status(404).json({ message: 'Tradesman profile not found' });
    }

    const responses = await prisma.jobResponse.findMany({
      where: { tradesmanId: tradesman.id },
      include: {
        job: {
          include: {
            customer: {
              include: {
                user: true
              }
            },
            services: {
              include: {
                service: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(responses);
  } catch (error) {
    console.error('Get tradesman jobs error:', error);
    res.status(500).json({ message: 'Failed to get jobs' });
  }
});

router.put('/profile', authenticate, authorize('TRADESMAN'), upload.fields([
  { name: 'portfolioImages', maxCount: 10 },
  { name: 'certifications', maxCount: 5 }
]), async (req: AuthRequest, res) => {
  try {
    const { description, landline, certificationTitles } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const tradesman = await prisma.tradesman.findUnique({
      where: { userId: req.user!.userId }
    });

    if (!tradesman) {
      return res.status(404).json({ message: 'Tradesman profile not found' });
    }

    await prisma.tradesman.update({
      where: { id: tradesman.id },
      data: {
        description: description || tradesman.description,
        landline: landline || tradesman.landline
      }
    });

    if (files.portfolioImages) {
      await prisma.portfolioImage.createMany({
        data: files.portfolioImages.map(file => ({
          tradesmanId: tradesman.id,
          imageUrl: `/uploads/${file.filename}`
        }))
      });
    }

    if (files.certifications && certificationTitles) {
      const titles = Array.isArray(certificationTitles) ? certificationTitles : JSON.parse(certificationTitles || '[]');
      await prisma.certification.createMany({
        data: files.certifications.map((file, index) => ({
          tradesmanId: tradesman.id,
          title: titles[index] || 'Certification',
          imageUrl: `/uploads/${file.filename}`
        }))
      });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update tradesman profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

export default router;
