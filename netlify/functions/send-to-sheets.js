const https = require('https');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Parse form data
    const data = JSON.parse(event.body);
    const { name, phone, telegram, product, budget, revenue, timeline, source, country, language, page } = data;

    // Google Apps Script URL
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbynWLpvlTsH5tY8HIgFm2rFH5ntDd7-Ne7mGeasqSk78jaPcFiiTjvK-nSBXH4Y7AXQ8A/exec';

    // Prepare data
    const sheetData = JSON.stringify({
      name: name || '',
      phone: phone || '',
      telegram: telegram || '',
      product: product || '',
      budget: budget || '',
      revenue: revenue || '',
      timeline: timeline || '',
      source: source || 'Unknown',
      country: country || 'Unknown',
      language: language || 'EN',
      page: page || ''
    });

    console.log('Sending to Google Sheets:', sheetData);

    // Send POST to Google Sheets
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
            // Non-JSON response, assume success
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
        body: JSON.stringify({ success: true, message: 'Form submitted successfully!' })
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
        error: 'Submission error: ' + error.message
      })
    };
  }
};
