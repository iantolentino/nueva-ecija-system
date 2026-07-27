import { renderPublicLayout } from '../lib/layout.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).send('Method not allowed');
    return;
  }

  const content = `<section class="public-hero">
    <div class="container public-hero-grid">
      <div>
        <p class="page-kicker">Nueva Ecija Citizen Services</p>
        <h1>Public information and service requests, without a trip to the office.</h1>
        <p>View announcements, check public events, and participate in scheduled hearings. Staff-only records and approvals remain inside the secured portal.</p>
        <div class="public-actions">
          <a class="btn" href="/public/announcements">View announcements</a>
          <a class="btn btn-secondary" href="/public/events">Open events calendar</a>
        </div>
      </div>
      <div class="public-hero-panel">
        <h2>Available now</h2>
        <ul>
          <li>Community service announcements</li>
          <li>Read-only public events calendar</li>
          <li>Upcoming public hearings and pending public comments</li>
        </ul>
      </div>
    </div>
  </section>
  <section class="container">
    <div class="public-card-grid">
      <a class="module-card tone-services" href="/public/announcements"><span class="module-icon">AN</span><span><strong>Announcements</strong><small>Community notices and service updates</small></span></a>
      <a class="module-card tone-services" href="/public/events"><span class="module-icon">EV</span><span><strong>Events Calendar</strong><small>Public activities and schedules</small></span></a>
      <a class="module-card tone-services" href="/public/hearings"><span class="module-icon">PH</span><span><strong>Public Hearings</strong><small>Upcoming hearings and citizen comments</small></span></a>
    </div>
  </section>`;

  res.status(200).send(renderPublicLayout({ title: 'Home', activePath: '/', content }));
}
