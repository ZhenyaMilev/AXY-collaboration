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
    const { name, phone, telegram } = data;

    // Получаем данные Telegram из переменных окружения
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // Проверяем наличие необходимых переменных окружения
    if (!botToken || !chatId) {
      console.error('Missing env vars:', { botToken: !!botToken, chatId: !!chatId });
      throw new Error('Missing Telegram configuration');
    }

    // Формируем сообщение
    const message = `🆕 Новая заявка с сайта!\n\n👤 Имя: ${name}\n📞 Телефон: ${phone}\n✈️ Telegram: ${telegram}`;

    // Отправляем в Telegram через https
    const telegramData = JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML'
    });

    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.telegram.org',
        path: `/bot${botToken}/sendMessage`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(telegramData)
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
            reject(new Error('Invalid JSON response from Telegram'));
          }
        });
      });

      req.on('error', (error) => {
        console.error('Request error:', error);
        reject(error);
      });

      req.write(telegramData);
      req.end();
    });

    console.log('Telegram response:', result);

    if (result.ok) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, message: 'Заявка отправлена!' })
      };
    } else {
      console.error('Telegram API error:', result);
      throw new Error('Telegram API error: ' + JSON.stringify(result));
    }

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Ошибка отправки заявки: ' + error.message })
    };
  }
};
