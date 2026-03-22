# Frontend Testing Guide

## 🧪 Testing Login Credentials

While the backend is in development, you can use the following mock credentials to log in and test different dashboard views. 

**Password for all accounts:** `demo123`

| Role | Email | Dashboard Path |
|------|-------|----------------|
| **Logistics Manager** | `lm001@cargocore.com` | `/logistic/dashboard` |
| **Warehouse Manager** | `wm001@cargocore.com` | `/warehouse/dashboard` |
| **Dispatcher** | `ds001@cargocore.com` | `/dispatcher/dashboard` |
| **Vendor** | `vd001@cargocore.com` | `/vendor/dashboard` |
| **Customer** | `cs001@cargocore.com` | `/individual/dashboard` |
| **AI Support** | `ai001@cargocore.com` | `/ai/dashboard` |

## Notes
- These credentials bypass real authentication.
- If you use Google Login or OTP currently, it is mocked to assign the `customer` role.
