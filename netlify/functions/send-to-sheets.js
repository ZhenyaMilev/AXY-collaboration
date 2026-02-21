const https = require('https');

exports.handler = async (event, context) => {
  // Разрешаем только POST запросы
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Парсим данные формы
    const data = JSON.parse(event.body);
    const { name, phone, telegram, product, budget, timeline, source, country, language } = data;

    // URL вашего Google Apps Script
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyakqVEnddvJFiu_hH4QCIRw5C6ElPjVbB1Qb8zAaz_9-jEzx5rxfv76rzsWi0FuF4CeA/exec';

    // Формируем данные для отправки
    const sheetData = JSON.stringify({
      name: name || '',
      phone: phone || '',
      telegram: telegram || '',
      product: product || '',
      budget: budget || '',
      timeline: timeline || '',
      source: source || 'Неизвестно',
      country: country || 'Unknown',
      language: language || 'RU'
    });

    console.log('Sending to Google Sheets:', sheetData);

    // Отправляем POST запрос в Google Sheets
    const result = await new Promise((resolve, reject) => {
      const url = new URL(GOOGLE_SCRIPT_URL);

      const options = {
        hostname: url.hostname,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(sheetData)
        }
      };

      const req = https.request(options, (res) => {
        let responseBody = '';

        res.on('data', (chunk) => {
          responseBody += chunk;
        });

        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseBody);
            resolve(parsed);
          } catch (e) {
            // Если ответ не JSON, считаем что успешно
            console.log('Response:', responseBody);
            resolve({ success: true });
          }
        });
      });

      req.on('error', (error) => {
        console.error('Request error:', error);
        reject(error);
      });

      req.write(sheetData);
      req.end();
    });

    console.log('Google Sheets response:', result);

    if (result.success !== false) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, message: 'Заявка успешно отправлена!' })
      };
    } else {
      throw new Error('Google Sheets API error: ' + (result.error || 'Unknown error'));
    }

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Ошибка отправки заявки: ' + error.message
      })
    };
  }
};
