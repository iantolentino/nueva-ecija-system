import { getDb } from '../lib/db.js';
import { body, field, page, textarea } from '../lib/module-utils.js';
import { escapeHtml } from '../lib/layout.js';
import { requireAuth } from '../lib/middleware.js';
import { logAudit } from '../lib/models.js';

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

function renderCalendar({ cursor, selectedDate, eventsByDate }) {
  const first = new Date(cursor);
  const next = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 1));
  const prev = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() - 1, 1));
  const daysInMonth = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  const leading = first.getUTCDay();
  const cells = [];

  for (let i = 0; i < leading; i += 1) cells.push('<div class="calendar-day is-muted" aria-hidden="true"></div>');
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), day));
    const key = isoDate(date);
    const dayEvents = eventsByDate.get(key) || [];
    const isSelected = key === selectedDate;
    cells.push(`<a class="calendar-day ${dayEvents.length ? 'has-events' : ''} ${isSelected ? 'is-selected' : ''}" href="/events?month=${monthParam(cursor)}&date=${key}">
      <span class="calendar-date">${day}</span>
      ${dayEvents.slice(0, 2).map((event) => `<span class="calendar-event-chip">${escapeHtml(event.title)}</span>`).join('')}
      ${dayEvents.length > 2 ? `<span class="calendar-more">+${dayEvents.length - 2} more</span>` : ''}
    </a>`);
  }

  return `<section class="calendar-shell">
    <div class="calendar-toolbar">
      <a class="btn btn-secondary btn-small" href="/events?month=${monthParam(prev)}">Previous</a>
      <h2>${escapeHtml(formatMonth(cursor))}</h2>
      <a class="btn btn-secondary btn-small" href="/events?month=${monthParam(next)}">Next</a>
    </div>
    <div class="calendar-weekdays">${WEEKDAYS.map((day) => `<span>${day}</span>`).join('')}</div>
    <div class="calendar-grid" aria-label="Events calendar">${cells.join('')}</div>
  </section>`;
}

function renderDetails(selectedDate, events) {
  const readable = new Date(`${selectedDate}T00:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
  return `<aside class="calendar-details">
    <h2>${escapeHtml(readable)}</h2>
    ${events.length ? events.map((event) => {
      const time = new Date(event.event_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      return `<article class="event-detail">
        <span class="badge">${escapeHtml(time)}</span>
        <h3>${escapeHtml(event.title)}</h3>
        <p>${escapeHtml(event.location || 'Location to be announced')}</p>
        <p>${escapeHtml(event.description || '')}</p>
      </article>`;
    }).join('') : '<p>No events scheduled on this date.</p>'}
  </aside>`;
}

export default async function handler(req, res) {
  const sql = getDb();
  const staff = await requireAuth(req, sql);

  if (req.method === 'POST') {
    if (!staff) {
      res.writeHead(302, { Location: '/login' }).end();
      return;
    }
    const data = body(req);
    await sql`
      INSERT INTO events (title, event_date, location, description, created_by_staff_id)
      VALUES (${String(data.title || '')}, ${String(data.event_date || '')}, ${String(data.location || '')}, ${String(data.description || '')}, ${staff.id}::uuid)
    `;
    await logAudit(sql, { staffId: staff.id, action: 'create', module: 'events', details: { title: data.title } });
    res.writeHead(302, { Location: `/events?month=${String(data.event_date || '').slice(0, 7)}` }).end();
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, POST');
    res.status(405).send('Method not allowed');
    return;
  }

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
  const selectedEvents = eventsByDate.get(selectedDate) || [];
  const form = staff ? `<form class="card event-form" method="post">
    <h2>Add event</h2>
    <div class="form-row">${field('title', 'Event title', 'text', 'required')}${field('event_date', 'Date and time', 'datetime-local', 'required')}</div>
    ${field('location', 'Location')}
    ${textarea('description', 'Description', 'rows="3"')}
    <button class="btn">Create event</button>
  </form>` : '';

  const content = `<p class="page-kicker">Month view for provincial activities and scheduled public events.</p>
    <div class="calendar-layout">
      ${renderCalendar({ cursor, selectedDate, eventsByDate })}
      ${renderDetails(selectedDate, selectedEvents)}
    </div>
    ${form}`;
  res.status(200).send(page({ title: 'Events Calendar', staff, content }));
}
