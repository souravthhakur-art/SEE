#!/usr/bin/env bash
#
# scripts/verify-sprint-2-3.sh
#
# One-shot §4.6 quality gate for Sprint 2.3 (Media Library).
#
# Why this script exists: sessions 3, 4, and 5 all independently
# re-confirmed the exact same thing — this sandbox cannot reach
# binaries.prisma.sh (Prisma's engine host) or the Neon DATABASE_URL
# host, so `prisma generate` / `migrate` / `build` can never actually
# pass here. This script assumes you're running it somewhere that
# DOES have real network access (your laptop, a Codespace, CI) and
# just runs the six §4.6 commands in the required order, stopping at
# the first failure so you don't waste time re-typing them by hand or
# accidentally skipping one.
#
# Usage:
#   bash scripts/verify-sprint-2-3.sh
#
# What it does NOT do: decide anything for you. `prisma migrate
# deploy` is destructive (it drops the old ProductImage table per the
# hand-authored migration in prisma/migrations/20260714090000_media_library/).
# The script pauses and asks for explicit confirmation before that one
# step — read prisma/migrations/20260714090000_media_library/migration.sql
# and take a DB backup/snapshot BEFORE answering "yes". See
# context/13-sprint-2_3-handoff-session4.md §3.2 for the full rationale.
#
# Output: everything is also written to a timestamped log file in the
# repo root (sprint-2-3-verify-<timestamp>.log) so the real build/lint
# output is available verbatim for the §5 final report — no need to
# re-run anything just to copy-paste results into the report.

set -uo pipefail

LOG_FILE="sprint-2-3-verify-$(date +%Y%m%d-%H%M%S).log"
STEP_NUM=0
TOTAL_STEPS=6

log() {
  echo "$@" | tee -a "$LOG_FILE"
}

run_step() {
  STEP_NUM=$((STEP_NUM + 1))
  local desc="$1"
  shift
  log ""
  log "════════════════════════════════════════════════════════════"
  log "[$STEP_NUM/$TOTAL_STEPS] $desc"
  log "  \$ $*"
  log "════════════════════════════════════════════════════════════"

  # Run the command, tee-ing combined stdout+stderr into the log
  # while still surfacing it live in the terminal. `set -o pipefail`
  # (set at the top of this script) makes the pipeline's exit code
  # equal to the command's real exit code, not tee's.
  if "$@" 2>&1 | tee -a "$LOG_FILE"; then
    log "✅ Step $STEP_NUM/$TOTAL_STEPS passed."
  else
    log ""
    log "❌ STOPPED at step $STEP_NUM/$TOTAL_STEPS ($desc) — non-zero exit."
    log "   Full output above and in $LOG_FILE. Fix this before re-running —"
    log "   the remaining steps depend on this one and were NOT run."
    exit 1
  fi
}

log "Sprint 2.3 — §4.6 Quality Gate"
log "Started: $(date)"
log "Log file: $LOG_FILE"

# ---------------------------------------------------------------
# Step 1/6 — npm install
# ---------------------------------------------------------------
run_step "npm install" npm install

# ---------------------------------------------------------------
# Step 2/6 — prisma generate
# ---------------------------------------------------------------
run_step "npx prisma generate" npx prisma generate

# ---------------------------------------------------------------
# Step 3/6 — prisma migrate deploy (DESTRUCTIVE — confirm first)
# ---------------------------------------------------------------
log ""
log "────────────────────────────────────────────────────────────"
log "Before step 3/6 (prisma migrate deploy):"
log "  This applies prisma/migrations/20260715000000_media_library_and_pantry/migration.sql,"
log "  which DROPS the old ProductImage table after backfilling Media/ProductMedia,"
log "  and CREATES the Pantry/PantryItem/PantrySchedule/PantryPause/PantryDelivery/PantryHistory tables."
log "  Have you (a) read that migration file and (b) taken a DB backup?"
log "────────────────────────────────────────────────────────────"
read -r -p "Type 'yes' to proceed with prisma migrate deploy: " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  log "Stopped before step 3/6 — user did not confirm. Nothing destructive was run."
  log "Re-run this script once you've reviewed the migration and backed up the DB."
  exit 1
fi
run_step "npx prisma migrate deploy" npx prisma migrate deploy

# ---------------------------------------------------------------
# Step 4/6 — prisma db seed (idempotent, safe to re-run)
# ---------------------------------------------------------------
run_step "npx prisma db seed" npx prisma db seed

# ---------------------------------------------------------------
# Step 5/6 — lint
# ---------------------------------------------------------------
run_step "npm run lint" npm run lint

# ---------------------------------------------------------------
# Step 6/6 — build (the one real unknown per the handoff docs)
# ---------------------------------------------------------------
run_step "npm run build" npm run build

log ""
log "════════════════════════════════════════════════════════════"
log "✅ ALL 6 STEPS PASSED."
log "Finished: $(date)"
log "Full output saved to: $LOG_FILE"
log ""
log "Next steps (see context/13-sprint-2_3-handoff-session4.md,"
log "\"What's left\" section, for full detail):"
log "  1. Manually click through: Media List → Create → Edit → Detail →"
log "     Delete (blocked-while-in-use AND successful-when-unused paths),"
log "     then Product edit → Images → pick from library → save → confirm"
log "     the admin product detail page shows it (not storefront)."
log "  2. Only then update context/06-progress.md (Media Library → Completed)."
log "  3. Write the §5 final report using the real output in $LOG_FILE."
log "════════════════════════════════════════════════════════════"
