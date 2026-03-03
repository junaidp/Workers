import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const servicesData = {
  'Solar Installation Services': {
    slug: 'solar-installation-services',
    services: [
      'Residential Solar Panel Installation',
      'Commercial Solar Installation',
      'Solar Panel Maintenance',
      'Solar Panel Repair',
      'Solar Battery Installation'
    ]
  },
  'Home Services': {
    slug: 'home-services',
    services: {
      'Electrician Services': [
        'Ceiling Fan Installation',
        'SMD Lights Installation (Without Wiring)',
        'SMD Lights Installation (With Wiring)',
        '32-42 Inch LED TV or LCD Mounting',
        '43-65 Inch LED TV or LCD Mounting',
        'LED TV Dismounting',
        'Switchboard Button Replacement',
        'Switchboard Socket Replacement',
        'Change Over Switch Installation',
        'Pressure Motor Installation',
        'Single Phase Breaker Replacement',
        'Single Phase Distribution Box Installation',
        'Water Tank Automatic Switch Installation',
        'Manual Washing Machine Repairing',
        'Automatic Washing Machine Repairing',
        'Fan Dimmer Switch Installation',
        'UPS Repairing',
        'UPS Installation (Without Wiring)',
        'UPS Wiring',
        'Exhaust Fan Installation',
        'Electrical Wiring',
        'Water Pump Repairing',
        'House Electric Work',
        'Door Pillar Lights',
        'Fancy Light Installation (Without Wiring)',
        'Fancy Light Installation (With Wiring)',
        'Kitchen Hood Installation',
        'Kitchen Hood Repairing',
        'Power Plug Installation (Without Wiring)',
        'Power Plug Installation (With Wiring)',
        'Light Plug (With Wiring)',
        'Light Plug (Without Wiring)',
        'Ceiling Fan Repairing',
        'Tube Light Installation',
        'Tube Light Replacement',
        'Tube Light Repairing',
        'Sub-Meter Installation'
      ],
      'AC Services': [
        'AC General Service',
        'AC Installation',
        'AC Repairing',
        'AC Mounting and Dismounting'
      ],
      'Home Appliances Repair': [
        'Cooking Range Repairing',
        'Automatic Washing Machine Repairing',
        'Automatic Washing Machine General Service',
        'Oven Range Services',
        'Kitchen Hood Installation',
        'Kitchen Hood Repairing'
      ],
      'Plumber Services': [
        'Mixer Tap Installation',
        'Single Tap Installation',
        'Sink Spindle Change',
        'Muslim Shower Replacement',
        'Water Motor Installation',
        'Kitchen Leakage Repairing',
        'Commode Tank Machine Repairing',
        'Hot or Cold Water Piping',
        'Washroom Accessory Installation',
        'Kitchen Drain Blockage',
        'Automatic Washing Machine Installation',
        'Commode Tank Machine Replacement',
        'Water Motor Repairing',
        'Oven Range Service',
        'Water Tank Supply Issue',
        'Gas Pipe Wiring',
        'House Plumbing Work',
        'Commode Installation',
        'Pipeline Water Leakage',
        'Drain Pipe Installation',
        'Sink Installation',
        'Sink Pipe Replacement',
        'Water Tank Installation',
        'Handle Valve Replacement',
        'Handle Valve Installation',
        'Bath Shower Installation',
        'Washbasin Installation'
      ],
      'Geyser Services': [
        'Instant Geyser Service',
        'Instant Geyser Installation',
        'Instant Geyser Dismounting',
        'Instant Geyser Repairing',
        'Gas Geyser Service',
        'Gas Geyser Installation',
        'Gas Geyser Repairing',
        'Gas Geyser Dismounting',
        'Instant Electric Geyser Service',
        'Instant Electric Geyser Installation',
        'Instant Electric Geyser Repairing',
        'Instant Electric Geyser Dismounting'
      ],
      'Handyman Services': [
        'Curtain Rod Installation',
        'Art Hanging',
        'Mirror Hanging',
        'Picture Hanging',
        'Shelf Hanging',
        'Room Clock Hanging'
      ],
      'Painter Services': [
        'House Paint (Outdoor)',
        'House Paint (Indoor)',
        'Furniture Polishing',
        'Gray Structure Paint',
        'Door Polish',
        'Tables Polish',
        'Window Paint',
        'Door Paint'
      ],
      'Carpenter Services': [
        'Wardrobe Repairing',
        'Door Installation',
        'Door Repairing',
        'Carpenter Work',
        'Drawer Repairing',
        'Furniture Repairing',
        'Room Door Lock Installation',
        'Drawer Lock Installation',
        'Catcher Replacement'
      ],
      'Home Inspection Services': [
        'Electrical Inspection',
        'Plumbing and Sanitary Inspection',
        'Paint Inspection',
        'Wood Work Inspection',
        'Floor Tiles Inspection',
        'Water Pressure and Quality Inspection',
        'Wood and Paint Moisture Inspection',
        'Endoscope Inspection'
      ],
      'Pest Control Services': [
        'General Fumigation',
        'Cockroach Treatment',
        'Bed Bugs Treatment',
        'Dengue Spray',
        'Disinfection Services'
      ]
    }
  },
  'Cleaning Services': {
    slug: 'cleaning-services',
    services: {
      'Car Detailing Services': [
        'Seats Removing and Cleaning',
        'Interior Cleaning',
        'Dashboard Polishing',
        'Engine Cleaning',
        'Shampoo Body Wash',
        'Compound Polishing'
      ],
      'Carpet Cleaning Services': [
        'Carpet Cleaning',
        'Rug Cleaning'
      ],
      'Water Tank Cleaning Services': [
        'Cement Water Tank Cleaning',
        'Plastic Water Tank Cleaning'
      ],
      'Chair Cleaning Services': [
        'Chair Cleaning'
      ],
      'Curtain Cleaning Services': [
        'Curtain Cleaning',
        'Blind Cleaning'
      ],
      'Deep Cleaning Services (Commercial)': [
        'Office Deep Cleaning',
        'Restaurant Deep Cleaning',
        'Educational Institute Deep Cleaning',
        'Hospital Deep Cleaning',
        'Salon Deep Cleaning'
      ],
      'Deep Cleaning Services (Residential)': [
        'Full House Deep Cleaning',
        'Room Deep Cleaning',
        'Kitchen Deep Cleaning',
        'Washroom Deep Cleaning'
      ],
      'Mattress Cleaning Services': [
        'Single Mattress Cleaning',
        'Double Mattress Cleaning'
      ],
      'Sofa Cleaning Services': [
        'Sofa Cleaning',
        'Dewan Cleaning',
        'Sofa Cum Bed Cleaning'
      ],
      'Solar Panel Cleaning Services': [
        'Solar Panel Cleaning'
      ]
    }
  },
  'Personal Care (Female Only)': {
    slug: 'personal-care-female',
    services: {
      'Facial Services': [
        'Gold Facial',
        'Derma Whitening Facial',
        'Janssen Facial Without Polisher',
        'Janssen Facial With Polisher',
        'Hydra Facial',
        'Face Cleanser',
        'Skin Polisher',
        'Face Polisher With Cleanser'
      ],
      'Hair Styling & Hair Cut': [
        'Hair Cut with Blow Dry',
        'Hair Styling',
        'Child Hair Cut with Hairstyling',
        'Child Hair Cut',
        'Wash-Blowdry-Nail Polish and Threading'
      ],
      'Makeup Services': [
        'Eye Makeup Without Lashes',
        'Eye Makeup With Lashes',
        'Party Makeup',
        'Party Makeup With Hair Styling',
        'Party Makeup With Free Hairstyling and Lashes',
        'Engagement Makeup with Free Hairstyling and Lashes',
        'Nikkah Makeup with Free Hairstyling and Lashes',
        'Barat Makeup',
        'Walima Makeup'
      ],
      'Hair Treatment': [
        'Hair Dye and Wash',
        'Hair Dye Application',
        'Hair Protein Treatment',
        'Shoulder Length Keratin Treatment',
        'Mid Length Keratin Treatment',
        'Hip Length Keratin Treatment',
        'Shoulder Length Hair Rebonding',
        'Mid Length Hair Rebonding',
        'Hip Length Hair Rebonding',
        'Shoulder Length Highlights',
        'Mid Length Highlights',
        'Hip Length Highlights',
        'Shoulder Length Lowlights',
        'Mid Length Lowlights',
        'Hip Length Lowlights',
        'Shoulder Length Streaking',
        'Mid Length Streaking',
        'Hip Length Streaking'
      ],
      'Mani Pedi': [
        'Mani Pedi',
        'Mani Pedi With Nail Paint',
        'Mani Pedi With Paraffin Wax - Signature',
        'Manicure',
        'Pedicure'
      ],
      'Mehndi Services': [
        'Bridal Special Mehndi',
        'Mehndi On Hand Two Sides',
        'Mehndi On Full Arm One Side',
        'Mehndi On Full Arms Two Sides'
      ],
      'Waxing Services': [
        'Full Body Waxing',
        'Half Body Waxing',
        'Arms Waxing',
        'Legs Waxing',
        'Underarm Waxing',
        'Face Waxing'
      ]
    }
  }
};

async function seedServices() {
  console.log('Seeding services...');

  for (const [categoryName, categoryData] of Object.entries(servicesData)) {
    const category = await prisma.serviceCategory.upsert({
      where: { slug: categoryData.slug },
      update: {},
      create: {
        name: categoryName,
        slug: categoryData.slug,
        description: `Professional ${categoryName.toLowerCase()} in Pakistan`,
        isActive: true
      }
    });

    const services = categoryData.services;
    
    if (Array.isArray(services)) {
      for (const serviceName of services) {
        const slug = serviceName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        await prisma.service.upsert({
          where: { slug },
          update: {},
          create: {
            categoryId: category.id,
            name: serviceName,
            slug,
            description: `Professional ${serviceName.toLowerCase()} service`,
            level: 1,
            isActive: true
          }
        });
      }
    } else {
      for (const [parentName, childServices] of Object.entries(services)) {
        const parentSlug = parentName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const parent = await prisma.service.upsert({
          where: { slug: parentSlug },
          update: {},
          create: {
            categoryId: category.id,
            name: parentName,
            slug: parentSlug,
            description: `Professional ${parentName.toLowerCase()}`,
            level: 1,
            isActive: true
          }
        });

        for (const childName of childServices as string[]) {
          const childSlug = childName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          await prisma.service.upsert({
            where: { slug: childSlug },
            update: {},
            create: {
              categoryId: category.id,
              name: childName,
              slug: childSlug,
              description: `Professional ${childName.toLowerCase()} service`,
              parentId: parent.id,
              level: 2,
              isActive: true
            }
          });
        }
      }
    }
  }

  console.log('Services seeded successfully');
}

async function seedAdmin() {
  console.log('Seeding admin user...');

  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!existingAdmin) {
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@workersmarketplace.com',
        mobile: '3001234567',
        whatsapp: '+923001234567',
        role: 'ADMIN',
        firstName: 'Admin',
        lastName: 'User',
        isEmailVerified: true,
        isWhatsappVerified: true,
        countryCode: '+92',
        admin: {
          create: {}
        }
      }
    });

    console.log('Admin user created:', adminUser.email);
  } else {
    console.log('Admin user already exists');
  }
}

async function main() {
  try {
    await seedAdmin();
    await seedServices();
    console.log('Database seeding completed!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
