# Настройка Google Sheets для приема заявок

## Шаг 1: Создать Google Таблицу

1. Откройте [Google Sheets](https://sheets.google.com)
2. Создайте новую таблицу с названием "AXY Заявки"
3. В первой строке создайте заголовки столбцов:
   - A1: Дата и время
   - B1: Имя
   - C1: Телефон
   - D1: Telegram/WhatsApp
   - E1: Продукт
   - F1: Бюджет
   - G1: Когда начать
   - H1: Источник
   - I1: Страна

## Шаг 2: Создать Google Apps Script

1. В Google Таблице откройте **Расширения → Apps Script**
2. Удалите весь код и вставьте следующий скрипт:

```javascript
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
      data.country || ''
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
```

3. Нажмите **Сохранить** (иконка дискеты)
4. Нажмите **Развернуть → Новое развертывание**
5. Выберите тип: **Веб-приложение**
6. Настройки:
   - **Описание**: "AXY Form Handler"
   - **Выполнить как**: "Я (ваш email)"
   - **У кого есть доступ**: "Все"
7. Нажмите **Развернуть**
8. **Скопируйте URL веб-приложения** (он будет выглядеть как: `https://script.google.com/macros/s/...../exec`)
9. Предоставьте разрешения если попросит

## Шаг 3: Получить URL для формы

После развертывания вы получите URL вида:
```
https://script.google.com/macros/s/AKfycbxxx.../exec
```

**Скопируйте этот URL** - он понадобится для обновления формы на сайте.

## Шаг 4: Обновить сайт

Этот URL нужно будет вставить в код формы вместо текущего Netlify endpoint.

---

## Проверка работы

После настройки, при отправке формы на сайте:
1. Данные автоматически попадут в Google Таблицу
2. В таблице появится новая строка с:
   - Датой и временем заявки
   - Всеми данными из формы
   - Страной посетителя

## Дополнительные возможности

### Уведомления на email
Можете добавить в скрипт отправку email уведомлений:

```javascript
// Добавьте эту строку в функцию doPost после sheet.appendRow():
MailApp.sendEmail({
  to: 'your-email@example.com',
  subject: 'Новая заявка с сайта AXY',
  body: `Имя: ${data.name}\nТелефон: ${data.phone}\nПродукт: ${data.product}`
});
```

### Форматирование таблицы
Можете настроить автоформатирование столбцов:
- Столбец A (Дата): Формат → Дата и время
- Столбцы B-I: Автоматическая ширина

### Фильтры и сортировка
Включите фильтры для удобного поиска заявок:
- Выделите первую строку с заголовками
- Данные → Создать фильтр
