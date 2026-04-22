# Driver App Backend Integration

## Current API calls

- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/logistics/vehicles`
- `GET /api/v1/logistics/drivers/me/dashboard`
- `POST /api/v1/logistics/drivers/me/bind-vehicle`
- `POST /api/v1/logistics/drivers/me/crew/{labourerId}/check-in`
- `GET /api/v1/orders`
- `POST /api/v1/orders/{id}/transition`
- `POST /api/v1/orders/{id}/proof-of-delivery`
- `POST /api/v1/logistics/drivers/me/location`
- `POST /api/v1/logistics/drivers/me/shift/start`
- `POST /api/v1/logistics/drivers/me/shift/end`

## Local setup

```bash
cd driver-app
npm install
npm run build
npx cap sync android
npx cap open android
```

## Environment config

```env
VITE_API_BASE_URL=http://localhost:8000
```

Optional Android override values:

- Real phone over USB: `VITE_API_BASE_URL_ANDROID=http://localhost:8000`
- Android emulator: `VITE_API_BASE_URL_ANDROID=http://10.0.2.2:8000`
- Real phone over Wi-Fi: `VITE_API_BASE_URL_ANDROID=http://<your-computer-ip>:8000`

## Real Android phone checklist

### Option 1: USB debugging with `adb reverse`

Use this when your backend is running on `127.0.0.1:8000` or `localhost:8000`.

```bash
adb devices
adb reverse tcp:8000 tcp:8000
```

Then keep:

```env
VITE_API_BASE_URL_ANDROID=http://localhost:8000
```

### Option 2: Same Wi-Fi network

Use this when the phone and computer are on the same network.

1. Start the backend on all interfaces:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

2. Set:

```env
VITE_API_BASE_URL_ANDROID=http://<your-computer-ip>:8000
```

3. Rebuild and sync the Android app:

```bash
npm run build
npx cap sync android
```

## Authentication notes

- The login form sends the Driver ID in the `email` field because the backend accepts either email or username there.
- The logged-in user must have role `DRIVER` or `driver`.

## Troubleshooting

### `Failed to fetch`

- The app could not reach the backend at all.
- On a real Android phone, USB debugging alone is not enough.
- Use `adb reverse tcp:8000 tcp:8000`, or switch `VITE_API_BASE_URL_ANDROID` to your computer IP and run the backend with `--host 0.0.0.0`.

### Login works in Swagger/Postman but not on phone

- Check `adb devices` shows the phone as authorized.
- Rebuild after changing `.env`:

```bash
npm run build
npx cap sync android
```

### Login succeeds but driver is rejected

- Check the backend login response contains role `DRIVER` or `driver`.

### Orders do not appear

- Make sure the driver has active orders that are not in `DRAFT`, `CANCELLED`, or `CLOSED`.
