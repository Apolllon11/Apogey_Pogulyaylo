// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();

const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.TG_BOT_TOKEN;
const CHAT_ID = process.env.TG_CHAT_ID;

if (!BOT_TOKEN || !CHAT_ID) {
    console.error('Не задан TG_BOT_TOKEN или TG_CHAT_ID в .env');
    process.exit(1);
}

// чтобы читать JSON из тела запросов
app.use(express.json());

/**
 * Маршруты для страниц
 * /              -> html/index.html
 * /index.html    -> html/index.html
 * /services.html -> html/services.html
 * /career.html   -> html/career.html
 * /knowledge.html-> html/knowledge.html
 * /about.html    -> html/about.html
 */

// главная
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

// остальные страницы
const pages = ['index', 'services', 'career', 'knowledge', 'about'];

pages.forEach((page) => {
    app.get(`/${page}.html`, (req, res) => {
        res.sendFile(path.join(__dirname, 'html', `${page}.html`));
    });
});

/**
 * Хелпер: красиво собираем текст для Telegram
 */
function buildTelegramMessage(type, fields) {
    const isCareer = type === 'career';

    const lines = [];
    if (isCareer) {
        lines.push('📌 Заявка от соискателя');
    } else {
        lines.push('📌 Заявка от бухгалтера / клиента');
    }
    lines.push(''); // пустая строка

    const clientOrder = ['org', 'region', 'fio', 'phone', 'email', 'task'];
    const clientLabels = {
        org: 'Учреждение',
        region: 'Регион',
        fio: 'Контактное лицо',
        phone: 'Телефон',
        email: 'E-mail',
        task: 'Задача / комментарий по 1С',
    };

    const careerOrder = ['name', 'city', 'status', 'direction', 'phone', 'email', 'about', 'resume'];
    const careerLabels = {
        name: 'Имя',
        city: 'Город',
        status: 'Статус',
        direction: 'Направление',
        phone: 'Телефон',
        email: 'E-mail',
        about: 'О себе',
        resume: 'Ссылка на резюме',
    };

    const order = isCareer ? careerOrder : clientOrder;
    const labels = isCareer ? careerLabels : clientLabels;

    // Сначала выводим поля в нужном порядке
    order.forEach((key) => {
        const raw = fields[key];
        if (!raw) return;

        const value = String(raw).trim();
        if (!value) return;

        const label = labels[key] || key;
        lines.push(`• ${label}: ${value}`);
    });

    // Если вдруг есть какие-то дополнительные поля — добавим их в конец
    Object.entries(fields).forEach(([key, raw]) => {
        if (!raw) return;
        if (order.includes(key)) return;

        const value = String(raw).trim();
        if (!value) return;

        lines.push(`• ${key}: ${value}`);
    });

    lines.push('');
    lines.push('————');
    lines.push('Отправлено с сайта (форма заявки).');

    return lines.join('\n');
}

/**
 * API: приём заявок и отправка в Telegram
 */
app.post('/api/lead', async (req, res) => {
    try {
        // из main.js приходит объект формата:
        // { type: "client" | "career", ...остальные поля формы }
        const { type = 'client', ...fields } = req.body || {};

        const text = buildTelegramMessage(type, fields);

        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

        const tgRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text,
                // Без parse_mode, чтобы не ловить ошибки на спецсимволах
            }),
        });

        const data = await tgRes.json();
        if (!data.ok) {
            console.error('Ошибка Telegram:', data);
            return res.status(500).json({ ok: false, error: 'telegram_error' });
        }

        res.json({ ok: true });
    } catch (err) {
        console.error('Ошибка сервера при отправке в Telegram:', err);
        res.status(500).json({ ok: false, error: 'server_error' });
    }
});

/**
 * Раздача статики: css, js, LogoFull.svg, /html/.
 * Этот middleware идёт ПОСЛЕ маршрутов, чтобы не мешать /api/lead и страницам.
 */
app.use(express.static(__dirname));

app.listen(PORT, () => {
    console.log('Server running on http://localhost:' + PORT);
});