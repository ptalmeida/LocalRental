#!/bin/bash

# Aggressive test: Send many requests in parallel without delay

echo "Testing rate limiter with parallel requests"
echo "=============================================="
echo ""

# Create a temporary file to store results
tmpfile=$(mktemp)

# Send 40 requests in parallel (all at once)
for i in {1..410}; do
    (
        status=$(curl -X POST http://localhost:8087/sum \
            -H "Content-Type: application/json" \
            -d '{"a": 1, "b": 2}' \
            -s -o /dev/null -w "%{http_code}")
        echo "$i $status" >> "$tmpfile"
    ) &
done

# Wait for all background jobs to complete
wait

# Count results
success=$(grep " 200$" "$tmpfile" | wc -l)
limited=$(grep " 429$" "$tmpfile" | wc -l)

echo "Sent 40 parallel requests"
echo "=============================================="
echo "Results:"
echo "  Successful (200): $success"
echo "  Rate Limited (429): $limited"
echo "=============================================="

# Show some rate limited responses if any
if [ $limited -gt 0 ]; then
    echo ""
    echo "Rate limiting IS working! ✓"
fi

# Cleanup
rm "$tmpfile"
