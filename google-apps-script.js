function doPost(e) {
  try {
    // Получаем активную таблицу
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Парсим JSON данные
    const data = JSON.parse(e.postData.contents);

    // Текущая дата и время
    const timestamp = new Date();

    // Добавляем новую строку с данными
    sheet.appendRow([
      timestamp,
      data.name || '',
      data.phone || '',
      data.telegram || '',
      data.product || '',
      data.budget || '',
      data.timeline || '',
      data.source || '',
      data.country || '',
      data.language || ''  // Новое поле: язык версии сайта (RU/EN)
    ]);

    // Возвращаем успешный ответ
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Возвращаем ошибку
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
