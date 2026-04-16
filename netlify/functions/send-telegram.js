const https = require('https');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body);
    const { name, phone, telegram, revenue, source, country, page } = data;

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error('Missing env vars:', { botToken: !!botToken, chatId: !!chatId });
      throw new Error('Missing Telegram configuration');
    }

    let message = `🆕 Новая заявка с сайта!\n\n`;
    message += `👤 Имя: ${name || '—'}\n`;
    if (phone) message += `📞 Телефон: ${phone}\n`;
    if (telegram) message += `✈️ Telegram/WhatsApp: ${telegram}\n`;
    if (revenue) message += `💰 Revenue: ${revenue}\n`;
    message += `📍 Источник: ${source || 'Неизвестно'}\n`;
    message += `🌍 Страна: ${country || 'Unknown'}`;
    if (page) message += `\n🔗 Страница: ${page}`;
    message += `\n\n📋 <a href="https://docs.google.com/spreadsheets/d/14yqrzYHgNRBbkWFaihKAuhaE3AiFlwP5h_6UmYuLUkE/edit#gid=0">Все лиды</a>`;

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
        res.on('data', (chunk) => { responseBody += chunk; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(responseBody));
          } catch (e) {
            reject(new Error('Invalid JSON response from Telegram'));
          }
        });
      });

      req.on('error', reject);
      req.write(telegramData);
      req.end();
    });

    if (result.ok) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true })
      };
    } else {
      throw new Error('Telegram API error: ' + JSON.stringify(result));
    }

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
