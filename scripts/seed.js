/**
 * Seed script — populates the solutions table.
 *
 * Usage (from project root):
 *   node scripts/seed.js
 *
 * Requires env vars (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
 * in a .env file or exported in the shell.
 */
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load .env manually (no dotenv dependency)
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(url, key);

// Starter set of 20 solutions across categories (extend to 7,000 via your pipeline)
const SEED = [
  { sprint: 'S1', category: 'Education', title: 'Community AI Literacy Hubs', description: 'Free neighborhood drop-in centers where residents learn AI tools for job searches, small business, and homework help. Staffed by trained volunteers and paired with local libraries.', ai_usage: 'AI drafts personalized learning plans; multilingual chatbots answer questions in real time.', impact: ['+40% digital skills', '500 residents per hub/year'], city: 'Detroit' },
  { sprint: 'S1', category: 'Education', title: 'Youth Coding Corps', description: 'Summer and afterschool program teaching web development and data basics to teens, with paid apprenticeships at local companies.', ai_usage: 'AI mentor provides 24/7 code feedback; adaptive curriculum adjusts to each student.', impact: ['300 teens trained/year', '80% job placement'], city: 'St. Louis' },
  { sprint: 'S1', category: 'Healthcare', title: 'Mobile Health Kiosks', description: 'Solar-powered kiosks in transit hubs offering blood pressure checks, telehealth booths, and appointment booking for community clinics.', ai_usage: 'AI triage assistant routes patients to the right care level.', impact: ['10k checkups/year', '30% fewer ER visits for chronic care'], city: 'Detroit' },
  { sprint: 'S1', category: 'Public Safety', title: 'Smart Streetlight Network', description: 'Upgrade streetlights with sensors that brighten on demand, detect gunshots, and alert patrols — cutting response times and energy use.', ai_usage: 'AI analyzes audio and motion patterns to dispatch the right resources.', impact: ['40% faster response', '25% energy savings'], city: 'St. Louis' },
  { sprint: 'S1', category: 'Environment', title: 'Vacant Lot Rewilding Program', description: 'Convert vacant lots into pollinator gardens and rain gardens that absorb stormwater, cool neighborhoods, and create green jobs.', ai_usage: 'AI prioritizes lots by flood risk, soil quality, and proximity to schools.', impact: ['100 lots rewilded', '500k gallons stormwater absorbed'], city: 'Detroit' },
  { sprint: 'S1', category: 'Transportation', title: 'Fair Fares Transit Card', description: 'Income-based transit fares with a smart card that auto-applies discounts and free transfers, removing financial barriers to mobility.', ai_usage: 'AI predicts ridership patterns to optimize bus frequency.', impact: ['+25% ridership', '$400/yr savings per rider'], city: 'St. Louis' },
  { sprint: 'S1', category: 'Economic Development', title: 'Neighborhood Business Accelerator', description: '12-week accelerator for local entrepreneurs with shared workspaces, mentorship, and microloans.', ai_usage: 'AI matches founders with mentors and flags grant opportunities.', impact: ['50 businesses/year', '200 jobs created'], city: 'Detroit' },
  { sprint: 'S1', category: 'Housing', title: 'Adaptive Reuse Housing Fund', description: 'Financing and fast-track permits to convert vacant commercial buildings into affordable housing.', ai_usage: 'AI models building feasibility and renovation costs at scale.', impact: ['1,000 new units', '3-year payback'], city: 'St. Louis' },
  { sprint: 'S1', category: 'Digital Equity', title: 'Free Community Wi-Fi Mesh', description: 'Community-owned mesh Wi-Fi across public housing and parks, with digital navigators to onboard residents.', ai_usage: 'AI load-balances the mesh and identifies dead zones.', impact: ['20k residents connected', '98% uptime'], city: 'Detroit' },
  { sprint: 'S1', category: 'Food Security', title: 'Urban Food Oasis Network', description: 'Year-round greenhouse network supplying fresh produce to corner stores in food deserts, run by cooperative worker-owners.', ai_usage: 'AI optimizes planting cycles and predicts local demand.', impact: ['40k residents served', '30% cheaper produce'], city: 'St. Louis' },
  { sprint: 'S1', category: 'Youth', title: 'City Youth Councils', description: 'Formal youth councils with real budget authority over a city youth fund, supported by adult mentors.', ai_usage: 'AI aggregates youth input across channels into actionable proposals.', impact: ['500 youth engaged', '20 proposals funded'], city: 'Detroit' },
  { sprint: 'S1', category: 'Aging', title: 'Age-Friendly Concierge Line', description: 'A phone-first service where older adults get help with benefits, rides, and home repairs from trained navigators.', ai_usage: 'AI voice assistant handles routine questions; humans step in for complex cases.', impact: ['15k seniors served', '2hr avg resolution'], city: 'St. Louis' },
  { sprint: 'S2', category: 'Education', title: 'Teacher AI Co-Pilot', description: 'District-wide tool that drafts lesson plans, differentiates materials, and translates content for multilingual classrooms — saving teachers 5 hours a week.', ai_usage: 'AI generates and localizes curriculum-aligned materials.', impact: ['5 hrs saved/teacher/week', '90% teacher retention'], city: null },
  { sprint: 'S2', category: 'Environment', title: 'Resilience Corps', description: 'Paid training corps for young adults doing climate resilience work: tree planting, flood-barrier installation, and home weatherization.', ai_usage: 'AI maps vulnerable blocks and schedules crews.', impact: ['200 corps members', '10k trees planted'], city: null },
  { sprint: 'S2', category: 'Public Safety', title: 'Community Responder Units', description: 'Civilian teams (medics, social workers, de-escalation specialists) handle non-violent 911 calls, freeing police for emergencies.', ai_usage: 'AI triages 911 calls to the right responder.', impact: ['30% of calls diverted', '45% fewer arrests for low-level issues'], city: 'St. Louis' },
  { sprint: 'S2', category: 'Healthcare', title: 'School-Based Mental Health', description: 'Embedded mental health clinics in every high school with telehealth backup and peer support training.', ai_usage: 'AI screening flags at-risk students early while preserving privacy.', impact: ['12k students served', '50% reduction in crisis ER visits'], city: 'Detroit' },
  { sprint: 'S2', category: 'Transportation', title: 'Complete Streets Pilot', description: 'Reconfigure 20 miles of arterial roads for safe biking, walking, and bus priority, with daylighting at intersections.', ai_usage: 'AI traffic simulation optimizes signal timing.', impact: ['-40% crashes', '+35% bike ridership'], city: null },
  { sprint: 'S2', category: 'Economic Development', title: 'Buy Local Procurement Portal', description: 'Digital marketplace where city departments and anchors buy from local, minority-owned suppliers with instant certification.', ai_usage: 'AI matches RFPs to qualified local vendors.', impact: ['$50M local spend redirected', '500 new vendors'], city: 'Detroit' },
  { sprint: 'S2', category: 'Digital Equity', title: 'Device Lending Library', description: 'Library-based laptop and hotspot lending with on-site tech support, funded by corporate device donations.', ai_usage: 'AI manages inventory and predicts demand by branch.', impact: ['8k devices circulating', '90% return rate'], city: null },
  { sprint: 'S2', category: 'Housing', title: 'Landlord Repair Accelerator', description: 'Fast, low-cost repair financing and inspection reform to fix rental housing hazards without displacing tenants.', ai_usage: 'AI flags high-risk properties from inspection data.', impact: ['5k units repaired', '0 displacement'], city: 'St. Louis' },
  { sprint: 'S2', category: 'Food Security', title: 'Food Rescue Dispatch', description: 'Real-time dispatch of volunteers to pick up surplus food from restaurants and deliver to shelters and pantries.', ai_usage: 'AI predicts surplus and optimizes routes.', impact: ['1M lbs rescued/year', '2k meals/day'], city: 'Detroit' },
];

async function seed() {
  // Insert city-tagged first, then the national ones
  const { data, error } = await supabase.from('solutions').insert(SEED).select('id, title');
  if (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
  console.log(`Seeded ${data.length} solutions.`);
}

seed();
