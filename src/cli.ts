#!/usr/bin/env node
import { cronToHuman } from "./cronToHuman.js";
import { humanToCron } from "./humanToCron.js";
import { getNextRuns } from "./nextRuns.js";

function main(): void {
  const args = process.argv.slice(2);
  let explainExpr: string | undefined;
  let fromText: string | undefined;
  let nextCount = 0;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--explain" && args[i + 1]) {
      explainExpr = args[++i];
    } else if (arg === "--from-text" && args[i + 1]) {
      fromText = args[++i];
    } else if (arg === "--next" && args[i + 1]) {
      nextCount = Number(args[++i]);
    }
  }

  if (!explainExpr && !fromText) {
    console.error(
      "Usage: cron-humanizer --explain \"30 7 * * 1-5\" [--next 5] | --from-text \"every weekday at 07:30\""
    );
    process.exit(1);
  }

  const cronExpr = fromText ? humanToCron(fromText) : explainExpr!;
  if (fromText) {
    console.log(`Cron: ${cronExpr}`);
  }
  console.log(`Human: ${cronToHuman(cronExpr)}`);

  if (nextCount > 0) {
    const runs = getNextRuns(cronExpr, nextCount);
    console.log("Next runs (UTC):");
    for (const run of runs) {
      console.log(`  - ${run.toISOString()}`);
    }
  }
}

main();
