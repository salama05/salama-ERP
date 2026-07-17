/**
 * Convex cron job configuration
 * Schedules periodic backup tasks and demo data reset.
 */

import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run daily backup every 24 hours
crons.interval(
  "daily_backup",
  { hours: 24 },
  internal.backup.performDailyBackup,
  {}
);

// Run weekly backup every 7 days (168 hours)
crons.interval(
  "weekly_backup", 
  { hours: 168 },
  internal.backup.performWeeklyBackup,
  {}
);

// Reset demo workspace data every hour to keep it fresh for visitors
crons.interval(
  "reset_demo_data",
  { hours: 1 },
  internal.demo.resetDemoData,
  {}
);

export default crons;
