/**
 * Convex cron job configuration
 * Schedules periodic backup tasks
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

// Alternative: Use cron syntax for specific times
// Uncomment and customize as needed:
// 
// crons.cron(
//   "daily_backup_specific_time",
//   "0 0 * * *", // Daily at midnight UTC
//   internal.backup.performDailyBackup,
//   {}
// );

export default crons;
