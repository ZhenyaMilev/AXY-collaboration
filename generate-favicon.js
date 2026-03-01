const sharp = require('sharp');
const fs = require('fs');

async function generateFavicon() {
  const size = 512; // Размер фавикона
  const radius = size / 2;

  // Создаем круглую маску
  const circleSvg = `
    <svg width="${size}" height="${size}">
      <circle cx="${radius}" cy="${radius}" r="${radius}" fill="#0a1628"/>
    </svg>
  `;

  // Читаем логотип
  const logo = await sharp('logo.png')
    .resize(Math.floor(size * 0.7), Math.floor(size * 0.7), { // Логотип занимает 70% размера
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toBuffer();

  // Создаем круглый синий фон
  const circleBackground = await sharp(Buffer.from(circleSvg))
    .png()
    .toBuffer();

  // Накладываем логотип на синий круг
  const favicon = await sharp(circleBackground)
    .composite([
      {
        input: logo,
        gravity: 'center'
      }
    ])
    .png()
    .toFile('favicon.png');

  console.log('✅ Favicon создан: favicon.png');

  // Создаем также маленькую версию 32x32
  await sharp('favicon.png')
    .resize(32, 32)
    .toFile('favicon-32x32.png');

  console.log('✅ Маленький фавикон создан: favicon-32x32.png');
}

generateFavicon().catch(err => {
  console.error('❌ Ошибка:', err.message);
  process.exit(1);
});
