function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    const timestamp = new Date();

    // Strip leading + so Sheets doesn't interpret as formula
    const phone = data.phone ? data.phone.replace(/^\+/, '') : '';
    const telegram = data.telegram ? data.telegram.replace(/^\+/, '') : '';

    sheet.appendRow([
      timestamp,
      data.name || '',
      phone,
      telegram,
      data.product || '',
      data.budget || '',
      data.timeline || '',
      data.source || '',
      data.country || '',
      data.language || ''
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
