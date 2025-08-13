const mongoose = require('mongoose')
const Product = require('../models/Product')
require('dotenv').config()

const sampleProducts = [
  // Electronics
  {
    name: 'iPhone 13 Pro',
    description: 'The latest iPhone with advanced camera system and A15 Bionic chip.',
    images: ['https://example.com/iphone13pro.jpg'],
    category: 'Electronics',
    price: 999,
    numericId: 1,
    specifications: {
      'Screen': '6.1-inch Super Retina XDR display',
      'Processor': 'A15 Bionic chip',
      'Storage': '128GB',
      'Camera': 'Triple 12MP camera system'
    }
  },
  {
    name: 'Samsung Galaxy S21',
    description: 'Powerful Android smartphone with 5G capability.',
    images: ['https://example.com/galaxys21.jpg'],
    category: 'Electronics',
    price: 799,
    numericId: 2,
    specifications: {
      'Screen': '6.2-inch Dynamic AMOLED 2X',
      'Processor': 'Exynos 2100',
      'Storage': '128GB',
      'Camera': 'Triple camera system'
    }
  },
  {
    name: 'MacBook Pro',
    description: 'Professional laptop with M1 Pro chip and stunning display.',
    images: ['https://example.com/macbookpro.jpg'],
    category: 'Electronics',
    price: 1299,
    numericId: 3,
    specifications: {
      'Screen': '14-inch Liquid Retina XDR display',
      'Processor': 'M1 Pro chip',
      'Storage': '512GB',
      'RAM': '16GB'
    }
  },
  {
    name: 'Sony WH-1000XM4',
    description: 'Premium noise-cancelling headphones with exceptional sound quality.',
    images: ['https://example.com/sonywh1000xm4.jpg'],
    category: 'Electronics',
    price: 349,
    numericId: 4,
    specifications: {
      'Battery Life': 'Up to 30 hours',
      'Noise Cancellation': 'Industry-leading',
      'Connectivity': 'Bluetooth 5.0',
      'Weight': '254g'
    }
  },
  {
    name: 'Nintendo Switch',
    description: 'Versatile gaming console that can be played at home or on the go.',
    images: ['https://example.com/nintendoswitch.jpg'],
    category: 'Electronics',
    price: 299,
    numericId: 5,
    specifications: {
      'Screen': '6.2-inch LCD',
      'Storage': '32GB',
      'Battery Life': '4.5-9 hours',
      'Weight': '297g'
    }
  },
  
  // Clothing
  {
    name: 'Men\'s Casual Premium Shirt',
    description: 'Comfortable and stylish casual shirt made from premium cotton.',
    images: ['https://example.com/mens-casual-shirt.jpg'],
    category: 'Clothing',
    price: 49.99,
    numericId: 6,
    specifications: {
      'Material': '100% Cotton',
      'Fit': 'Regular Fit',
      'Care': 'Machine washable',
      'Sizes': 'S, M, L, XL, XXL'
    }
  },
  {
    name: 'Women\'s Summer Dress',
    description: 'Light and breezy summer dress perfect for warm days.',
    images: ['https://example.com/womens-summer-dress.jpg'],
    category: 'Clothing',
    price: 59.99,
    numericId: 7,
    specifications: {
      'Material': 'Cotton Blend',
      'Style': 'Floral Print',
      'Length': 'Knee Length',
      'Sizes': 'XS, S, M, L, XL'
    }
  },
  {
    name: 'Men\'s Denim Jeans',
    description: 'Classic blue denim jeans with a comfortable fit.',
    images: ['https://example.com/mens-denim-jeans.jpg'],
    category: 'Clothing',
    price: 69.99,
    numericId: 8,
    specifications: {
      'Material': '98% Cotton, 2% Elastane',
      'Fit': 'Slim Fit',
      'Color': 'Blue',
      'Sizes': '30, 32, 34, 36, 38'
    }
  },
  {
    name: 'Women\'s Blazer',
    description: 'Professional blazer perfect for office wear.',
    images: ['https://example.com/womens-blazer.jpg'],
    category: 'Clothing',
    price: 89.99,
    numericId: 9,
    specifications: {
      'Material': 'Polyester Blend',
      'Style': 'Single Breasted',
      'Color': 'Black',
      'Sizes': 'XS, S, M, L, XL'
    }
  },
  {
    name: 'Unisex Hoodie',
    description: 'Warm and comfortable hoodie for casual wear.',
    images: ['https://example.com/unisex-hoodie.jpg'],
    category: 'Clothing',
    price: 54.99,
    numericId: 10,
    specifications: {
      'Material': 'Cotton Blend',
      'Style': 'Pullover',
      'Color': 'Gray',
      'Sizes': 'S, M, L, XL, XXL'
    }
  },
  
  // Home & Kitchen
  {
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with 12-cup capacity.',
    images: ['https://example.com/coffee-maker.jpg'],
    category: 'Home & Kitchen',
    price: 79.99,
    numericId: 11,
    specifications: {
      'Capacity': '12 cups',
      'Features': 'Programmable, Auto shut-off',
      'Color': 'Black',
      'Dimensions': '9.5 x 7.5 x 14 inches'
    }
  },
  {
    name: 'Bedding Set',
    description: 'Comfortable bedding set with 2 pillowcases and a duvet cover.',
    images: ['https://example.com/bedding-set.jpg'],
    category: 'Home & Kitchen',
    price: 89.99,
    numericId: 12,
    specifications: {
      'Material': '100% Cotton',
      'Size': 'Queen',
      'Color': 'White',
      'Includes': '1 Duvet Cover, 2 Pillowcases'
    }
  },
  {
    name: 'Blender',
    description: 'High-speed blender for smoothies and food processing.',
    images: ['https://example.com/blender.jpg'],
    category: 'Home & Kitchen',
    price: 69.99,
    numericId: 13,
    specifications: {
      'Power': '1200W',
      'Capacity': '64 oz',
      'Speed Settings': '6',
      'Color': 'Red'
    }
  },
  {
    name: 'Wall Clock',
    description: 'Modern wall clock with silent movement.',
    images: ['https://example.com/wall-clock.jpg'],
    category: 'Home & Kitchen',
    price: 29.99,
    numericId: 14,
    specifications: {
      'Material': 'Wood',
      'Size': '12 inches',
      'Style': 'Modern',
      'Color': 'Natural'
    }
  },
  {
    name: 'Throw Pillows',
    description: 'Decorative throw pillows for your sofa or bed.',
    images: ['https://example.com/throw-pillows.jpg'],
    category: 'Home & Kitchen',
    price: 24.99,
    numericId: 15,
    specifications: {
      'Material': 'Polyester',
      'Size': '18 x 18 inches',
      'Color': 'Blue',
      'Quantity': 'Set of 2'
    }
  }
]

const seedProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopeasy')
    console.log('Connected to MongoDB')

    // Clear existing products
    await Product.deleteMany({})
    console.log('Cleared existing products')

    // Insert sample products
    await Product.insertMany(sampleProducts)
    console.log('Inserted sample products')

    console.log('Seeding completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding products:', error)
    process.exit(1)
  }
}

seedProducts() 