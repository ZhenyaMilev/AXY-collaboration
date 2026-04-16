function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    const timestamp = new Date();

    // Prefix phone/telegram with apostrophe so Sheets treats them as text
    const phone = data.phone ? "'" + data.phone : '';
    const telegram = data.telegram ? "'" + data.telegram : '';

    sheet.appendRow([
      timestamp,
      data.name || '',
      phone,
      telegram,
      data.product || '',
      data.budget || '',
      data.revenue || '',
      data.timeline || '',
      data.source || '',
      data.country || '',
      data.language || '',
      data.page || ''
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
