#!/bin/bash

# Test Notification Script
# This script tests if the backend is actually sending FCM notifications

# Replace with actual device token from callee's logs
DEVICE_TOKEN="eUUu8zqzTpCRGP9nUPqBzf:APA91bF6mn_6VkTkUF4uWewhY3ULBzFVFUg33HUdNtLDgROo1y63oUp_bQP-oJTaKzXh9a7KXox8ml80ca3syF3W-BVX42ZZuRTLhsnjXYdjAMkcjbc1MXI"

BASE_URL="http://192.168.1.15:3000"

echo "=========================================="
echo "Testing Push Notification"
echo "=========================================="
echo ""
echo "Device Token: ${DEVICE_TOKEN:0:50}..."
echo "Backend URL: $BASE_URL"
echo ""

echo "Sending test notification..."
echo ""

curl -X POST "$BASE_URL/api/notifications/call" \
  -H "Content-Type: application/json" \
  -H "Accept: application/hal+json" \
  -d "{
  \"type\": \"VIDEO_CALL\",
  \"device_token\": \"$DEVICE_TOKEN\",
  \"callerName\": \"Test Caller\",
  \"callerId\": \"test_123\",
  \"roomName\": \"test_room_$(date +%s)\",
  \"callId\": \"test_call_$(date +%s)\"
}" \
  -w "\nHTTP Status: %{http_code}\n" \
  -v

echo ""
echo "=========================================="
echo "Test Complete"
echo ""
echo "What to check:"
echo "1. HTTP Status should be 200"
echo "2. Check callee's device for notification"
echo "3. Check callee's app logs for:"
echo "   📱 FOREGROUND NOTIFICATION RECEIVED"
echo ""
echo "If notification NOT received:"
echo "- Backend is not sending FCM notification"
echo "- See BACKEND_NOTIFICATION_FIX.md for solution"
echo "=========================================="
