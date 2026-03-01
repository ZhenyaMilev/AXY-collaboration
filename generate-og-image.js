const sharp = require('sharp');

async function generateOGImage() {
  const width = 1200;
  const height = 630;

  // Создаем градиентный фон как на сайте
  const backgroundSvg = `
    <svg width="${width}" height="${height}">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#0a1628;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#1a2942;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#0a1628;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grad)" />
    </svg>
  `;

  // Читаем логотип и изменяем размер
  const logo = await sharp('logo.png')
    .resize(Math.floor(width * 0.5), null, { // Логотип занимает 50% ширины
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toBuffer();

  // Создаем фон
  const background = await sharp(Buffer.from(backgroundSvg))
    .png()
    .toBuffer();

  // Накладываем логотип на фон (по центру)
  const ogImage = await sharp(background)
    .composite([
      {
        input: logo,
        gravity: 'center'
      }
    ])
    .jpeg({ quality: 95 })
    .toFile('og-image.jpg');

  console.log('✅ OG изображение для русской версии создано: og-image.jpg');

  // Создаем английскую версию (пока идентичную)
  await sharp(background)
    .composite([
      {
        input: logo,
        gravity: 'center'
      }
    ])
    .jpeg({ quality: 95 })
    .toFile('og-image-en.jpg');

  console.log('✅ OG изображение для английской версии создано: og-image-en.jpg');
}

generateOGImage().catch(err => {
  console.error('❌ Ошибка:', err.message);
  process.exit(1);
});
