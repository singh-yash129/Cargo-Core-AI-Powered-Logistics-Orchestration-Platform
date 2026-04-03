# API Mismatch Showcase

## Summary
- Total mismatches recorded: 1

## Mismatch Details

| Case ID | Endpoint | Input | Expected Output | Actual Output | Difference Summary |
|---|---|---|---|---|---|
| MM-ORD-001 | GET /api/v1/orders/track/{tracking_code} | {"path": {"tracking_code": "UNKNOWN-TRACKING"}} | {"reason": "Business expectation for unknown tracking code", "status_code": 404} | {"body": {"found": false, "message": "Tracking code not found", "tracking_code": "UNKNOWN-TRACKING"}, "status_code": 200} | Endpoint currently returns HTTP 200 with a not-found payload for unknown tracking codes instead of HTTP 404. |
