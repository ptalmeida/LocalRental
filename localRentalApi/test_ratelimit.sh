#!/bin/bash

# Test rate limiting by sending rapid requests

echo "Testing rate limiter (10 req/s, burst of 20)"
echo "=============================================="
echo ""

success=0
limited=0

for i in {1..25}; do
    response=$(curl -X POST http://localhost:8087/sum \
        -H "Content-Type: application/json" \
        -d '{"a": 1, "b": 2}' \
        -s -w "\n%{http_code}" 2>&1)

    status=$(echo "$response" | tail -n 1)

    if [ "$status" = "200" ]; then
        ((success++))
        echo "Request $i: ✓ Success (200)"
    elif [ "$status" = "429" ]; then
        ((limited++))
        echo "Request $i: ⚠ Rate Limited (429)"
    else
        echo "Request $i: ✗ Error ($status)"
    fi

    # Very short delay to simulate rapid requests
    sleep 0.01
done

echo ""
echo "=============================================="
echo "Results:"
echo "  Successful: $success"
echo "  Rate Limited: $limited"
echo "=============================================="
