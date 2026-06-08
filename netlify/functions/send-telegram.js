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
    const { name, phone, telegram, revenue, budget, source, country, page,
            utm_source, utm_medium, utm_campaign, utm_content, utm_term } = data;

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
    if (budget) message += `💰 Бюджет: ${budget}\n`;
    message += `📍 Источник: ${source || 'Неизвестно'}\n`;
    message += `🌍 Страна: ${country || 'Unknown'}`;
    if (page) message += `\n🔗 Страница: ${page}`;
    if (utm_source || utm_medium || utm_campaign || utm_content || utm_term) {
      message += `\n\n📊 UTM:`;
      if (utm_source) message += `\n• source: ${utm_source}`;
      if (utm_medium) message += `\n• medium: ${utm_medium}`;
      if (utm_campaign) message += `\n• campaign: ${utm_campaign}`;
      if (utm_content) message += `\n• adset: ${utm_content}`;
      if (utm_term) message += `\n• ad: ${utm_term}`;
    }
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
