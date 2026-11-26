# Cron Humanizer

Bidirectional 5-field cron expression parser, natural-language schedule compiler, and next-run calculator in TypeScript.

## Features
- `cronToHuman(expr)`: Validates 5-field cron expressions (`minute hour dom month dow`) and produces clear English descriptions.
- `humanToCron(phrase)`: Converts natural-language schedules (e.g., `"every day at 07:30"`, `"every weekday at 06:45"`, `"every 15 minutes"`, `"every sunday at 20:00"`) into 5-field cron strings.
- `getNextRuns(expr, count, fromDate)`: Computes the next `N` execution `Date` instances with zero external dependencies.
- CLI executable supporting `--explain`, `--from-text`, and `--next <N>`.

## Setup & Usage

```bash
npm install
npm test
npm run build
node dist/cli.js --explain "30 7 * * 1-5" --next 3
```
