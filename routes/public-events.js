import { getDb } from '../lib/db.js';
import { escapeHtml, renderPublicLayout } from '../lib/layout.js';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function monthParam(date) {
  return date.toISOString().slice(0, 7);
}

function parseMonth(value) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})$/);
  if (!match) {
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
  }
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));
}

function formatMonth(date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

function groupEvents(events) {
  return events.reduce((map, event) => {
    const key = isoDate(new Date(event.event_date));
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(event);
    return map;
  }, new Map());
}

function renderPublicCalendar({ cursor, selectedDate, eventsByDate }) {
  const next = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1));
  const prev = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() - 1, 1));
  const daysInMonth = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 0)).getUTCDate();
  const cells = [];
  for (let i = 0; i < cursor.getUTCDay(); i += 1) cells.push('<div class="calendar-day is-muted" aria-hidden="true"></div>');
  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = isoDate(new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), day)));
    const dayEvents = eventsByDate.get(key) || [];
    cells.push(`<a class="calendar-day ${dayEvents.length ? 'has-events' : ''} ${key === selectedDate ? 'is-selected' : ''}" href="/public/events?month=${monthParam(cursor)}&date=${key}">
      <span class="calendar-date">${day}</span>
      ${dayEvents.slice(0, 2).map((event) => `<span class="calendar-event-chip">${escapeHtml(event.title)}</span>`).join('')}
      ${dayEvents.length > 2 ? `<span class="calendar-more">+${dayEvents.length - 2} more</span>` : ''}
    </a>`);
  }
  return `<section class="calendar-shell">
    <div class="calendar-toolbar">
      <a class="btn btn-secondary btn-small" href="/public/events?month=${monthParam(prev)}">Previous</a>
      <h2>${escapeHtml(formatMonth(cursor))}</h2>
      <a class="btn btn-secondary btn-small" href="/public/events?month=${monthParam(next)}">Next</a>
    </div>
    <div class="calendar-weekdays">${WEEKDAYS.map((day) => `<span>${day}</span>`).join('')}</div>
    <div class="calendar-grid" aria-label="Public events calendar">${cells.join('')}</div>
  </section>`;
}

function renderDetails(selectedDate, events) {
  const readable = new Date(`${selectedDate}T00:00:00Z`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  return `<aside class="calendar-details">
    <h2>${escapeHtml(readable)}</h2>
    ${events.length ? events.map((event) => {
      const time = new Date(event.event_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      return `<article class="event-detail"><span class="badge">${escapeHtml(time)}</span><h3>${escapeHtml(event.title)}</h3><p>${escapeHtml(event.location || 'Location to be announced')}</p><p>${escapeHtml(event.description || '')}</p></article>`;
    }).join('') : '<p>No public events scheduled on this date.</p>'}
  </aside>`;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).send('Method not allowed');
    return;
  }

  const sql = getDb();
  const cursor = parseMonth(req.query?.month);
  const start = monthParam(cursor);
  const today = isoDate(new Date());
  const selectedDate = req.query?.date || (today.startsWith(start) ? today : `${start}-01`);
  const end = monthParam(new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1)));
  const events = await sql`
    SELECT *
    FROM events
    WHERE event_date >= (${start} || '-01')::timestamptz
      AND event_date < (${end} || '-01')::timestamptz
    ORDER BY event_date ASC
  `;
  const eventsByDate = groupEvents(events);
  const content = `<section class="container public-page">
    <p class="page-kicker">Public Calendar</p>
    <h1>Events Calendar</h1>
    <p class="public-lede">Read-only calendar of public provincial activities. Staff manage event posting inside the secured portal.</p>
    <div class="calendar-layout">${renderPublicCalendar({ cursor, selectedDate, eventsByDate })}${renderDetails(selectedDate, eventsByDate.get(selectedDate) || [])}</div>
  </section>`;

  res.status(200).send(renderPublicLayout({ title: 'Public Events Calendar', activePath: '/public/events', content }));
}
