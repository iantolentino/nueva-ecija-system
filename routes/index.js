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
          <li>Public applications and privacy-safe record checks</li>
        </ul>
      </div>
    </div>
  </section>
  <section class="container">
    <div class="public-card-grid">
      <a class="module-card tone-services" href="/public/announcements"><span class="module-icon">AN</span><span><strong>Announcements</strong><small>Community notices and service updates</small></span></a>
      <a class="module-card tone-services" href="/public/events"><span class="module-icon">EV</span><span><strong>Events Calendar</strong><small>Public activities and schedules</small></span></a>
      <a class="module-card tone-services" href="/public/hearings"><span class="module-icon">PH</span><span><strong>Public Hearings</strong><small>Upcoming hearings and citizen comments</small></span></a>
      <a class="module-card tone-services" href="/public/scholarships"><span class="module-icon">SC</span><span><strong>Scholarships</strong><small>Apply for staff-reviewed programs</small></span></a>
      <a class="module-card tone-services" href="/public/clearance-request"><span class="module-icon">CL</span><span><strong>Clearance Request</strong><small>Submit a barangay clearance request</small></span></a>
      <a class="module-card tone-employment" href="/public/jobs"><span class="module-icon">JO</span><span><strong>Job Opportunities</strong><small>View postings and apply</small></span></a>
      <a class="module-card tone-records" href="/public/record-check"><span class="module-icon">ID</span><span><strong>Citizen Record Check</strong><small>Privacy-safe record existence check</small></span></a>
      <a class="module-card tone-records" href="/public/household-check"><span class="module-icon">HM</span><span><strong>Household Check</strong><small>Check or request correction review</small></span></a>
    </div>
  </section>`;

  res.status(200).send(renderPublicLayout({ title: 'Home', activePath: '/', content }));
}
