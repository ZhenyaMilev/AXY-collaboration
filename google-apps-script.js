function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    const timestamp = new Date();

    // Prefix phone/telegram with apostrophe so Sheets treats them as text
    const phone = data.phone ? "'" + data.phone : '';
    const telegram = data.telegram ? "'" + data.telegram : '';

    // Use revenue as budget if budget is empty (Amazon form)
    const budget = data.budget || data.revenue || '';

    sheet.appendRow([
      timestamp,         // A: Дата и время
      data.name || '',   // B: Имя
      phone,             // C: Телефон
      telegram,          // D: Telegram
      data.product || '',// E: Продукт
      budget,            // F: Бюджет / Revenue
      data.timeline || '',// G: Сроки
      data.source || '', // H: Источник
      data.country || '',// I: Страна
      data.language || '',// J: Язык
      data.page || ''    // K: Страница
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
