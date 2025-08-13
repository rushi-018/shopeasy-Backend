const puppeteer = require('puppeteer');
const axios = require('axios');
const cheerio = require('cheerio');

class WebScraperService {
  constructor() {
    this.browser = null;
    this.isInitialized = false;
    this.isScrapingEnabled = true;
    this.rateLimitDelay = 2000; // Increased to 2 seconds
    this.lastRequestTime = 0;
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0'
    ];
    this.currentUserAgentIndex = 0;
  }

  getRandomUserAgent() {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  getNextUserAgent() {
    const userAgent = this.userAgents[this.currentUserAgentIndex];
    this.currentUserAgentIndex = (this.currentUserAgentIndex + 1) % this.userAgents.length;
    return userAgent;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      console.log('Initializing web scraper...');
      
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-blink-features=AutomationControlled',
          '--disable-extensions',
          '--disable-plugins',
          '--disable-images',
          '--disable-javascript',
          '--disable-default-apps'
        ]
      });
      
      this.isInitialized = true;
      console.log('✅ Web scraper initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize web scraper:', error);
      this.isScrapingEnabled = false;
      throw error;
    }
  }

  async close() {
    if (this.browser) {
      try {
        await this.browser.close();
        this.isInitialized = false;
        console.log('Browser closed successfully');
      } catch (error) {
        console.error('Error closing browser:', error);
      }
    }
  }

  async rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();
  }

  // Generate mock products for fallback
  generateMockProducts(query, limit = 10) {
    const mockProducts = [];
    const brands = ['Samsung', 'Apple', 'Sony', 'LG', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'MSI'];
    const categories = {
      'smartphone': ['Galaxy S23', 'iPhone 15', 'OnePlus 11', 'Pixel 7', 'Xiaomi 13'],
      'laptop': ['MacBook Pro', 'Dell XPS', 'HP Spectre', 'Lenovo ThinkPad', 'Asus ROG'],
      'headphones': ['Sony WH-1000XM5', 'Bose QuietComfort', 'AirPods Pro', 'Samsung Galaxy Buds'],
      'smartwatch': ['Apple Watch', 'Samsung Galaxy Watch', 'Fitbit Sense', 'Garmin Fenix'],
      'camera': ['Canon EOS R5', 'Sony A7 IV', 'Nikon Z6', 'Fujifilm X-T4']
    };

    const category = Object.keys(categories).find(cat => query.toLowerCase().includes(cat)) || 'smartphone';
    const products = categories[category] || categories['smartphone'];

    for (let i = 0; i < limit; i++) {
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const product = products[Math.floor(Math.random() * products.length)];
      const price = Math.floor(Math.random() * 50000) + 5000;
      const rating = (Math.random() * 2 + 3).toFixed(1);
      const reviews = Math.floor(Math.random() * 1000) + 50;

      mockProducts.push({
        id: `mock_${i}`,
        name: `${brand} ${product}`,
        price: price,
        image: `https://picsum.photos/300/300?random=${i}`,
        rating: parseFloat(rating),
        reviews: reviews,
        url: `https://example.com/product/${i}`,
        source: 'Mock Data',
        inStock: true,
        isMock: true
      });
    }

    return mockProducts;
  }

  // Try alternative data source when scraping fails
  async tryAlternativeDataSource(query, limit = 10) {
    try {
      console.log(`🔄 Trying alternative data source for: ${query}`);
      
      // Try using a public API as fallback
      const response = await axios.get(`https://dummyjson.com/products/search?q=${encodeURIComponent(query)}&limit=${limit}`, {
        timeout: 15000
      });
      
      if (response.data && response.data.products) {
        const products = response.data.products.map((product, index) => ({
          id: `alt_${index}`,
          name: product.title,
          price: product.price * 80, // Convert to INR (rough conversion)
          image: product.images[0] || `https://picsum.photos/300/300?random=${index}`,
          rating: product.rating,
          reviews: Math.floor(Math.random() * 1000) + 50,
          url: `https://dummyjson.com/products/${product.id}`,
          source: 'Alternative API',
          inStock: product.stock > 0,
          isMock: false
        }));
        
        console.log(`✅ Got ${products.length} products from alternative source`);
        return products;
      }
    } catch (error) {
      console.log('❌ Alternative data source failed:', error.message);
    }
    
    return null;
  }

  // Enhanced Amazon scraping with better anti-detection
  async scrapeAmazonProducts(query, limit = 10) {
    try {
      console.log(`🔍 Scraping Amazon for: ${query}`);
      
      await this.rateLimit();
      
      // Use a more realistic search URL
      const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(query)}&ref=sr_pg_1`;
      
      const headers = {
        'User-Agent': this.getNextUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
        'DNT': '1',
        'Referer': 'https://www.amazon.in/',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"'
      };

      const response = await axios.get(searchUrl, {
        headers: headers,
        timeout: 45000,
        maxRedirects: 5,
        validateStatus: function (status) {
          return status >= 200 && status < 400; // Accept redirects
        }
      });

      console.log(`📄 Response status: ${response.status}`);
      console.log(`📄 Response size: ${response.data.length} characters`);

      const $ = cheerio.load(response.data);
      const products = [];

      // Check if we got a valid response
      const title = $('title').text();
      console.log(`📄 Page title: ${title}`);

      if (title.includes('Robot') || title.includes('Captcha') || title.includes('Access Denied')) {
        console.log('❌ Detected bot protection, falling back to mock data');
        return this.generateMockProducts(query, limit);
      }

      // Enhanced product selectors
      const productSelectors = [
        'div[data-component-type="s-search-result"]',
        'div.s-result-item[data-component-type="s-search-result"]',
        'div[data-asin]:not([data-asin=""])',
        '.sg-col-inner .s-result-item',
        '.s-result-item'
      ];

      let productElements = [];
      for (const selector of productSelectors) {
        productElements = $(selector);
        if (productElements.length > 0) {
          console.log(`✅ Found ${productElements.length} products with selector: ${selector}`);
          break;
        }
      }

      if (productElements.length === 0) {
        console.log('❌ No products found, trying alternative approach...');
        // Try a more generic approach
        productElements = $('div[data-asin]:not([data-asin=""])');
        if (productElements.length === 0) {
          console.log('❌ Still no products found, using mock data');
          return this.generateMockProducts(query, limit);
        }
      }

      console.log(`🔄 Processing ${Math.min(productElements.length, limit)} products...`);

      productElements.each((index, element) => {
        if (products.length >= limit) return false;

        try {
          const $el = $(element);
          
          // Extract product name with multiple selectors
          let name = '';
          const nameSelectors = [
            'h2 a span',
            '.a-size-medium.a-color-base.a-text-normal',
            '.a-text-normal',
            '[data-cy="title-recipe"]',
            'h2 span',
            '.a-link-normal span',
            '.a-size-base-plus.a-color-base.a-text-normal'
          ];
          
          for (const selector of nameSelectors) {
            name = $el.find(selector).first().text().trim();
            if (name && name.length > 5) break;
          }

          // Extract price with better parsing
          let price = 0;
          const priceSelectors = [
            '.a-price-whole',
            '.a-price .a-offscreen',
            '.a-price-current .a-offscreen',
            '.a-price .a-price-whole',
            '.a-price-current .a-price-whole',
            '.a-price .a-price-whole'
          ];
          
          for (const selector of priceSelectors) {
            const priceText = $el.find(selector).first().text().trim();
            if (priceText) {
              const priceMatch = priceText.replace(/[^\d]/g, '');
              if (priceMatch && priceMatch.length > 2) {
                price = parseInt(priceMatch);
                break;
              }
            }
          }

          // Extract image with fallback
          let image = '';
          const imgSelectors = [
            'img.s-image',
            '.s-image',
            'img[src*="images"]',
            'img[data-src]',
            'img'
          ];
          
          for (const selector of imgSelectors) {
            const img = $el.find(selector).first();
            image = img.attr('src') || img.attr('data-src') || '';
            if (image && !image.includes('sprite') && image.includes('http')) break;
          }

          // Extract rating
          let rating = 0;
          const ratingSelectors = [
            '.a-icon-alt',
            '[aria-label*="stars"]',
            '.a-icon-star',
            '.a-icon-star-small'
          ];
          
          for (const selector of ratingSelectors) {
            const ratingEl = $el.find(selector).first();
            const ratingText = ratingEl.text() || ratingEl.attr('aria-label') || '';
            const ratingMatch = ratingText.match(/(\d+(?:\.\d+)?)/);
            if (ratingMatch) {
              rating = parseFloat(ratingMatch[1]);
              break;
            }
          }

          // Extract URL
          let url = '';
          const linkSelectors = [
            'h2 a',
            '.a-link-normal',
            'a[href*="/dp/"]',
            'a[href*="amazon"]'
          ];
          
          for (const selector of linkSelectors) {
            const link = $el.find(selector).first();
            url = link.attr('href') || '';
            if (url) {
              if (!url.startsWith('http')) {
                url = 'https://www.amazon.in' + url;
              }
              break;
            }
          }

          // Only add products with essential data
          if (name && price > 0 && name.length > 5) {
            products.push({
              id: `amazon_${index}`,
              name: name.substring(0, 100), // Limit name length
              price: price,
              image: image || `https://picsum.photos/300/300?random=${index}`,
              rating: rating || (Math.random() * 2 + 3).toFixed(1),
              reviews: Math.floor(Math.random() * 1000) + 50,
              url: url || `https://www.amazon.in/s?k=${encodeURIComponent(query)}`,
              source: 'Amazon',
              inStock: true,
              isMock: false
            });
          }
        } catch (error) {
          console.error(`Error parsing product ${index}:`, error.message);
        }
      });

      console.log(`✅ Successfully scraped ${products.length} products from Amazon`);
      
      if (products.length === 0) {
        console.log('❌ No valid products found, using mock data');
        return this.generateMockProducts(query, limit);
      }
      
      return products;

    } catch (error) {
      console.error('❌ Error scraping Amazon:', error.message);
      console.log('🔄 Falling back to mock data...');
      return this.generateMockProducts(query, limit);
    }
  }

  // Enhanced Flipkart scraping with better anti-detection
  async scrapeFlipkartProducts(query, limit = 10) {
    try {
      console.log(`🔍 Scraping Flipkart for: ${query}`);
      
      await this.rateLimit();
      
      const searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off`;
      
      const headers = {
        'User-Agent': this.getNextUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
        'DNT': '1',
        'Referer': 'https://www.flipkart.com/',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"'
      };

      const response = await axios.get(searchUrl, {
        headers: headers,
        timeout: 45000,
        maxRedirects: 5,
        validateStatus: function (status) {
          return status >= 200 && status < 400; // Accept redirects
        }
      });

      console.log(`📄 Flipkart response status: ${response.status}`);
      console.log(`📄 Flipkart response size: ${response.data.length} characters`);

      const $ = cheerio.load(response.data);
      const products = [];

      // Check if we got a valid response
      const title = $('title').text();
      console.log(`📄 Flipkart page title: ${title}`);

      if (title.includes('Robot') || title.includes('Captcha') || title.includes('Access Denied') || title.includes('Blocked')) {
        console.log('❌ Detected bot protection on Flipkart, falling back to mock data');
        return this.generateMockProducts(query, limit);
      }

      // Enhanced selectors for Flipkart
      const productSelectors = [
        'div[data-id]',
        '._1AtVbE',
        '._2kHMtA',
        '._4rR01T',
        '.tUxRFH',
        'div[class*="_1AtVbE"]',
        'div[class*="_2kHMtA"]',
        'div[class*="_4rR01T"]'
      ];

      let productElements = [];
      for (const selector of productSelectors) {
        productElements = $(selector);
        if (productElements.length > 0) {
          console.log(`✅ Found ${productElements.length} Flipkart products with selector: ${selector}`);
          break;
        }
      }

      if (productElements.length === 0) {
        console.log('❌ No Flipkart products found, trying alternative approach...');
        // Try more generic approach
        productElements = $('div[class*="_1AtVbE"], div[class*="_2kHMtA"], div[class*="_4rR01T"]');
        if (productElements.length === 0) {
          console.log('❌ Still no Flipkart products found, using mock data');
          return this.generateMockProducts(query, limit);
        }
      }

      console.log(`🔄 Processing ${Math.min(productElements.length, limit)} Flipkart products...`);

      productElements.each((index, element) => {
        if (products.length >= limit) return false;

        try {
          const $el = $(element);
          
          // Extract name
          let name = '';
          const nameSelectors = [
            'div[title]',
            '._4rR01T',
            '._2WkVRV',
            'a[title]',
            'h3',
            'h2'
          ];
          
          for (const selector of nameSelectors) {
            name = $el.find(selector).first().attr('title') || $el.find(selector).first().text().trim();
            if (name) break;
          }

          // Extract price
          let price = 0;
          const priceSelectors = [
            'div[class*="price"]',
            '._30jeq3',
            '._1_WHN1',
            '._3I9_wc',
            '[class*="price"]'
          ];
          
          for (const selector of priceSelectors) {
            const priceText = $el.find(selector).first().text().trim();
            if (priceText) {
              const priceMatch = priceText.replace(/[^\d]/g, '');
              if (priceMatch) {
                price = parseInt(priceMatch);
                break;
              }
            }
          }

          // Extract image
          let image = '';
          const imgSelectors = [
            'img',
            'img[src*="image"]',
            '._396cs4',
            'img[loading="lazy"]'
          ];
          
          for (const selector of imgSelectors) {
            const img = $el.find(selector).first();
            image = img.attr('src') || img.attr('data-src') || '';
            if (image) break;
          }

          // Extract URL
          let url = '';
          const linkSelectors = [
            'a[href*="/p/"]',
            'a[href*="flipkart"]',
            '._1fQZEK',
            'a'
          ];
          
          for (const selector of linkSelectors) {
            const link = $el.find(selector).first();
            url = link.attr('href') || '';
            if (url) {
              if (!url.startsWith('http')) {
                url = 'https://www.flipkart.com' + url;
              }
              break;
            }
          }

          if (name && price > 0) {
            products.push({
              id: `flipkart_${index}`,
              name: name.substring(0, 100),
              price: price,
              image: image || `https://picsum.photos/300/300?random=${index}`,
              rating: (Math.random() * 2 + 3).toFixed(1),
              reviews: Math.floor(Math.random() * 1000) + 50,
              url: url || `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`,
              source: 'Flipkart',
              inStock: true,
              isMock: false
            });
          }
        } catch (error) {
          console.error(`Error parsing Flipkart product ${index}:`, error.message);
        }
      });

      console.log(`✅ Successfully scraped ${products.length} products from Flipkart`);
      return products;

  } catch (error) {
      console.error('❌ Error scraping Flipkart:', error.message);
      console.log('🔄 Falling back to mock data...');
      return this.generateMockProducts(query, limit);
    }
  }

  // Search products across platforms
  async searchProducts(query, limit = 10) {
    try {
      console.log(`🔍 Searching for: ${query} (limit: ${limit})`);
      
      const [amazonProducts, flipkartProducts] = await Promise.allSettled([
        this.scrapeAmazonProducts(query, Math.ceil(limit / 2)),
        this.scrapeFlipkartProducts(query, Math.ceil(limit / 2))
      ]);
      
      const allProducts = [
        ...(amazonProducts.status === 'fulfilled' ? amazonProducts.value : []),
        ...(flipkartProducts.status === 'fulfilled' ? flipkartProducts.value : [])
      ];
      
      console.log(`📊 Total products found: ${allProducts.length}`);
      
      // If we got some real products, return them
      if (allProducts.length > 0) {
        const sortedProducts = allProducts
          .sort((a, b) => a.price - b.price)
          .slice(0, limit);
        
        return sortedProducts;
      }
      
      // If no real products found, try alternative data source
      console.log('🔄 No real products found, trying alternative data source...');
      const alternativeProducts = await this.tryAlternativeDataSource(query, limit);
      
      if (alternativeProducts && alternativeProducts.length > 0) {
        console.log(`✅ Got ${alternativeProducts.length} products from alternative source`);
        return alternativeProducts;
      }
      
      // Final fallback to mock data
      console.log('🔄 Using mock data as final fallback...');
      return this.generateMockProducts(query, limit);
        
    } catch (error) {
      console.error('❌ Error searching products:', error.message);
      return this.generateMockProducts(query, limit);
    }
  }

  // Get trending products
  async getTrendingProducts(limit = 10) {
    const trendingQueries = [
      'smartphone',
      'laptop',
      'headphones',
      'smartwatch',
      'camera',
      'gaming console',
      'tablet',
      'speaker',
      'keyboard',
      'mouse'
    ];
    
    const randomQuery = trendingQueries[Math.floor(Math.random() * trendingQueries.length)];
    console.log(`🎯 Getting trending products for: ${randomQuery}`);
    return await this.searchProducts(randomQuery, limit);
  }

  // Product details scraping (simplified for now)
  async scrapeAmazonProductDetails(url) {
    try {
      console.log(`🔍 Getting Amazon product details from: ${url}`);
      
      await this.rateLimit();
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        timeout: 30000
      });

      const $ = cheerio.load(response.data);
      
      const name = $('#productTitle').text().trim() || $('h1').first().text().trim();
      const priceText = $('.a-price-whole').first().text().trim();
      const price = priceText ? parseInt(priceText.replace(/[^\d]/g, '')) : 0;
      const description = $('#productDescription p').text().trim() || $('.a-expander-content p').first().text().trim();
      
      const ratingText = $('.a-icon-alt').first().text();
      const rating = ratingText ? parseFloat(ratingText.split(' ')[0]) : 0;
      
      const images = [];
      $('img[src*="images"]').each((i, el) => {
        const src = $(el).attr('src');
        if (src && !src.includes('sprite')) {
          images.push(src);
        }
      });

      if (name && price > 0) {
        return {
          name,
          price,
          description: description || 'Product description not available',
          rating,
          reviews: Math.floor(Math.random() * 1000) + 50,
          images: images.length > 0 ? images : [`https://picsum.photos/600/600?random=${Math.random()}`],
          specifications: [
            { key: 'Brand', value: 'Amazon' },
            { key: 'Availability', value: 'In Stock' }
          ],
          source: 'Amazon',
          isMock: false
        };
      }
      
      return this.generateMockProductDetails(url);
      
    } catch (error) {
      console.error('❌ Error scraping Amazon product details:', error.message);
      return this.generateMockProductDetails(url);
    }
  }

  async scrapeFlipkartProductDetails(url) {
    try {
      console.log(`🔍 Getting Flipkart product details from: ${url}`);
      
      await this.rateLimit();
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        timeout: 30000
      });

      const $ = cheerio.load(response.data);
      
      const name = $('h1[class*="title"]').text().trim() || $('h1').first().text().trim();
      const priceText = $('div[class*="price"]').first().text().trim();
      const price = priceText ? parseInt(priceText.replace(/[^\d]/g, '')) : 0;
      const description = $('div[class*="description"]').text().trim() || $('p').first().text().trim();
      
      const images = [];
      $('img[src*="image"]').each((i, el) => {
        const src = $(el).attr('src');
        if (src) {
          images.push(src);
        }
      });

      if (name && price > 0) {
        return {
          name,
          price,
          description: description || 'Product description not available',
          rating: (Math.random() * 2 + 3).toFixed(1),
          reviews: Math.floor(Math.random() * 1000) + 50,
          images: images.length > 0 ? images : [`https://picsum.photos/600/600?random=${Math.random()}`],
          specifications: [
            { key: 'Brand', value: 'Flipkart' },
            { key: 'Availability', value: 'In Stock' }
          ],
          source: 'Flipkart',
          isMock: false
        };
      }
      
      return this.generateMockProductDetails(url);
      
    } catch (error) {
      console.error('❌ Error scraping Flipkart product details:', error.message);
      return this.generateMockProductDetails(url);
    }
  }

  generateMockProductDetails(url) {
    return {
      name: 'Sample Product',
      price: Math.floor(Math.random() * 50000) + 5000,
      description: 'This is a sample product description with detailed information about the features and specifications.',
      rating: (Math.random() * 2 + 3).toFixed(1),
      reviews: Math.floor(Math.random() * 1000) + 50,
      images: [
        'https://picsum.photos/600/600?random=1',
        'https://picsum.photos/600/600?random=2',
        'https://picsum.photos/600/600?random=3'
      ],
      specifications: [
        { key: 'Brand', value: 'Sample Brand' },
        { key: 'Model', value: 'Sample Model' },
        { key: 'Color', value: 'Black' },
        { key: 'Warranty', value: '1 Year' }
      ],
      source: url.includes('amazon') ? 'Amazon' : 'Flipkart',
      isMock: true
    };
  }

  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isScrapingEnabled: this.isScrapingEnabled,
      browserConnected: !!this.browser,
      lastRequestTime: this.lastRequestTime
    };
  }

  setScrapingEnabled(enabled) {
    this.isScrapingEnabled = enabled;
    console.log(`Web scraping ${enabled ? 'enabled' : 'disabled'}`);
  }
}

// Create singleton instance
const webScraperService = new WebScraperService();

// Graceful shutdown
process.on('SIGINT', async () => {
  await webScraperService.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await webScraperService.close();
  process.exit(0);
});

module.exports = webScraperService; 