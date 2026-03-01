#!/bin/bash

# Test Wallet API Script
# This script tests the PUT /api/wallet/update endpoint

USER_ID="5844f740-94af-41cb-ba66-d02e849cbaf7"
BASE_URL="http://172.20.10.5:3000"

echo "=========================================="
echo "Testing Wallet API"
echo "=========================================="
echo ""

# Test 1: Get Balance
echo "1️⃣ Testing GET balance..."
echo "URL: $BASE_URL/api/wallet/balance/$USER_ID"
echo ""

curl -X GET \
  "$BASE_URL/api/wallet/balance/$USER_ID" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "=========================================="
echo ""

# Test 2: Update Wallet (Deduct ₹1)
echo "2️⃣ Testing PUT wallet update (deduct ₹1)..."
echo "URL: $BASE_URL/api/wallet/update"
echo "Body: {\"userId\":\"$USER_ID\",\"amount\":-1,\"reason\":\"VIDEO_CALL\"}"
echo ""

curl -X PUT \
  "$BASE_URL/api/wallet/update" \
  -H "accept: application/hal+json" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test-api-key-2024" \
  -H "X-Client-Secret: test-client-secret-2024" \
  -d "{\"userId\":\"$USER_ID\",\"amount\":-1,\"reason\":\"VIDEO_CALL\"}" \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "=========================================="
echo ""

# Test 3: Get Balance Again
echo "3️⃣ Testing GET balance again (verify deduction)..."
echo "URL: $BASE_URL/api/wallet/balance/$USER_ID"
echo ""

curl -X GET \
  "$BASE_URL/api/wallet/balance/$USER_ID" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "=========================================="
echo "Test Complete"
echo ""
echo "If you see HTTP Status: 200, the API is working!"
echo "If you see HTTP Status: 500, check your backend logs."
echo "=========================================="
