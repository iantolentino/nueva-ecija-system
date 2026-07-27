import announcements from '../routes/announcements.js';
import bloodDonors from '../routes/blood-donors.js';
import citizenDetail from '../routes/citizen/[id].js';
import citizenEdit from '../routes/citizen/[id]/edit.js';
import citizenNew from '../routes/citizen/new.js';
import clearances from '../routes/clearances.js';
import dashboard from '../routes/dashboard.js';
import directory from '../routes/directory.js';
import directoryImport from '../routes/directory/import.js';
import emergencyContacts from '../routes/emergency-contacts.js';
import events from '../routes/events.js';
import households from '../routes/households.js';
import index from '../routes/index.js';
import jobMatches from '../routes/job-matches.js';
import jobOpportunities from '../routes/job-opportunities.js';
import login from '../routes/login.js';
import logout from '../routes/logout.js';
import mtop from '../routes/mtop.js';
import publicHearings from '../routes/public-hearings.js';
import publicAnnouncements from '../routes/public-announcements.js';
import publicEvents from '../routes/public-events.js';
import publicHearingsView from '../routes/public-hearings-view.js';
import publicScholarships from '../routes/public-scholarships.js';
import publicClearanceRequest from '../routes/public-clearance-request.js';
import publicJobs from '../routes/public-jobs.js';
import publicRecordCheck from '../routes/public-record-check.js';
import publicHouseholdCheck from '../routes/public-household-check.js';
import qrPass from '../routes/qr-pass/[citizenId].js';
import qrPasses from '../routes/qr-passes.js';
import reliefDistribution from '../routes/relief-distribution.js';
import reports from '../routes/reports.js';
import scholarships from '../routes/scholarships.js';
import scholarshipApply from '../routes/scholarships/apply.js';
import scholarshipReview from '../routes/scholarships/[id]/review.js';
import skillsProfiles from '../routes/skills-profiles.js';
import staffAdmin from '../routes/staff-admin.js';
import vitalEvents from '../routes/vital-events.js';

const routes = [
  { pattern: /^\/$/, handler: index },
  { pattern: /^\/api\/?$/, handler: index },
  { pattern: /^\/public\/announcements\/?$/, handler: publicAnnouncements },
  { pattern: /^\/public\/events\/?$/, handler: publicEvents },
  { pattern: /^\/public\/hearings\/?$/, handler: publicHearingsView },
  { pattern: /^\/public\/scholarships\/?$/, handler: publicScholarships },
  { pattern: /^\/public\/clearance-request\/?$/, handler: publicClearanceRequest },
  { pattern: /^\/public\/jobs\/?$/, handler: publicJobs },
  { pattern: /^\/public\/record-check\/?$/, handler: publicRecordCheck },
  { pattern: /^\/public\/household-check\/?$/, handler: publicHouseholdCheck },
  { pattern: /^\/login\/?$/, handler: login },
  { pattern: /^\/api\/login\/?$/, handler: login },
  { pattern: /^\/logout\/?$/, handler: logout },
  { pattern: /^\/api\/logout\/?$/, handler: logout },
  { pattern: /^\/dashboard\/?$/, handler: dashboard },
  { pattern: /^\/directory\/?$/, handler: directory },
  { pattern: /^\/households\/?$/, handler: households },
  { pattern: /^\/directory\/import\/?$/, handler: directoryImport },
  { pattern: /^\/citizen\/new\/?$/, handler: citizenNew },
  { pattern: /^\/citizen\/([^/]+)\/edit\/?$/, handler: citizenEdit, params: ['id'] },
  { pattern: /^\/citizen\/([^/]+)\/?$/, handler: citizenDetail, params: ['id'] },
  { pattern: /^\/announcements\/?$/, handler: announcements },
  { pattern: /^\/mtop\/?$/, handler: mtop },
  { pattern: /^\/qr-pass\/([^/]+)\/?$/, handler: qrPass, params: ['citizenId'] },
  { pattern: /^\/qr-passes\/?$/, handler: qrPasses },
  { pattern: /^\/vital-events\/?$/, handler: vitalEvents },
  { pattern: /^\/blood-donors\/?$/, handler: bloodDonors },
  { pattern: /^\/public-hearings\/?$/, handler: publicHearings },
  { pattern: /^\/emergency-contacts\/?$/, handler: emergencyContacts },
  { pattern: /^\/clearances\/?$/, handler: clearances },
  { pattern: /^\/relief-distribution\/?$/, handler: reliefDistribution },
  { pattern: /^\/events\/?$/, handler: events },
  { pattern: /^\/reports\/?$/, handler: reports },
  { pattern: /^\/skills-profiles\/?$/, handler: skillsProfiles },
  { pattern: /^\/job-opportunities\/?$/, handler: jobOpportunities },
  { pattern: /^\/job-matches\/?$/, handler: jobMatches },
  { pattern: /^\/staff-admin\/?$/, handler: staffAdmin },
  { pattern: /^\/scholarships\/?$/, handler: scholarships },
  { pattern: /^\/scholarships\/apply\/?$/, handler: scholarshipApply },
  { pattern: /^\/scholarships\/([^/]+)\/review\/?$/, handler: scholarshipReview, params: ['id'] },
];

export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  for (const route of routes) {
    const match = pathname.match(route.pattern);
    if (!match) continue;

    req.query = Object.fromEntries(url.searchParams.entries());
    for (const [index, name] of (route.params || []).entries()) {
      req.query[name] = decodeURIComponent(match[index + 1]);
    }
    return route.handler(req, res);
  }

  res.status(404).send('Not found');
}
