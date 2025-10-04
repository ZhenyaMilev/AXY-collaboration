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

    // Ваши данные Telegram
    const botToken = '8443808141:AAFE8Ym6eOJ0MVRIEc4rGVeEnqaXnPIHv4w';
    const chatId = process.env.TELEGRAM_CHAT_ID; // Будем хранить в переменных окружения Netlify

    // Формируем сообщение
    const message = `🆕 Новая заявка с сайта!\n\n👤 Имя: ${name}\n📞 Телефон: ${phone}\n✈️ Telegram: ${telegram}`;

    // Отправляем в Telegram
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    const result = await response.json();

    if (result.ok) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, message: 'Заявка отправлена!' })
      };
    } else {
      throw new Error('Telegram API error');
    }

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Ошибка отправки заявки' })
    };
  }
};
