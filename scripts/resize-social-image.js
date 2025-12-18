const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration
const IMAGE_PATH = path.join(__dirname, '../public/assets/images/splashscreens/welcome.png');
const BACKUP_PATH = path.join(__dirname, '../public/assets/images/splashscreens/welcome-original.png');
const TARGET_WIDTH = 1200;
const TARGET_HEIGHT = 630;
const QUALITY = 90; // PNG quality (0-100)

async function resizeImage() {
  console.log('\n🖼️  Starting image resize for social media sharing...\n');
  
  // Check if image exists
  if (!fs.existsSync(IMAGE_PATH)) {
    console.error(`❌ Error: Image not found at ${IMAGE_PATH}`);
    process.exit(1);
  }
  
  try {
    // Get original image info
    const metadata = await sharp(IMAGE_PATH).metadata();
    console.log('📊 Original image info:');
    console.log(`   - Dimensions: ${metadata.width}x${metadata.height}`);
    console.log(`   - Format: ${metadata.format}`);
    console.log(`   - Size: ${(fs.statSync(IMAGE_PATH).size / 1024).toFixed(2)} KB\n`);
    
    // Create backup if it doesn't exist
    if (!fs.existsSync(BACKUP_PATH)) {
      console.log('💾 Creating backup of original image...');
      fs.copyFileSync(IMAGE_PATH, BACKUP_PATH);
      console.log(`✓ Backup created: ${BACKUP_PATH}\n`);
    } else {
      console.log('ℹ️  Backup already exists, skipping backup creation\n');
    }
    
    // Resize image
    console.log(`🔄 Resizing image to ${TARGET_WIDTH}x${TARGET_HEIGHT} (optimal for social media)...`);
    await sharp(IMAGE_PATH)
      .resize(TARGET_WIDTH, TARGET_HEIGHT, {
        fit: 'cover', // Cover the entire area, may crop if aspect ratio differs
        position: 'center', // Center the image when cropping
      })
      .png({ 
        quality: QUALITY,
        compressionLevel: 9 // Maximum compression for PNG
      })
      .toFile(IMAGE_PATH + '.tmp');
    
    // Replace original with resized version
    fs.renameSync(IMAGE_PATH + '.tmp', IMAGE_PATH);
    
    // Get new image info
    const newMetadata = await sharp(IMAGE_PATH).metadata();
    const newSize = fs.statSync(IMAGE_PATH).size;
    
    console.log('✅ Image resized successfully!\n');
    console.log('📊 New image info:');
    console.log(`   - Dimensions: ${newMetadata.width}x${newMetadata.height}`);
    console.log(`   - Format: ${newMetadata.format}`);
    console.log(`   - Size: ${(newSize / 1024).toFixed(2)} KB`);
    console.log(`   - Reduction: ${((1 - newSize / fs.statSync(BACKUP_PATH).size) * 100).toFixed(1)}% smaller\n`);
    console.log(`📍 Resized image: ${IMAGE_PATH}`);
    console.log(`💾 Original backup: ${BACKUP_PATH}\n`);
    console.log('💡 Note: Update og:image:width and og:image:height meta tags to 1200x630');
    
  } catch (error) {
    console.error('\n❌ Error resizing image:', error.message);
    process.exit(1);
  }
}

// Run the script
resizeImage();

