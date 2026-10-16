#!/usr/bin/env bash
set -euo pipefail

TARGET_URL="${1:-${URL:-http://localhost:8000/api/items}}"
CONCURRENCY="${CONCURRENCY:-10}"
TOTAL_REQUESTS="${TOTAL_REQUESTS:-1000}"

echo "=================================================="
echo " CloudSeats Concurrent Load Test Generator"
echo " Target:      $TARGET_URL"
echo " Concurrency: $CONCURRENCY parallel workers"
echo " Requests:    $TOTAL_REQUESTS requests"
echo "=================================================="

seq 1 "$TOTAL_REQUESTS" | xargs -n 1 -P "$CONCURRENCY" -I {} curl -s -o /dev/null -w "%{http_code}\n" "$TARGET_URL" | \
  awk '{counts[$1]++} END {print "\nStatus Code Distribution:"; for (code in counts) print "HTTP " code ": " counts[code]}'

echo ""
echo "Load test finished successfully. Check Prometheus metrics at /metrics or Grafana."
