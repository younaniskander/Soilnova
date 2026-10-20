# SoilNova delivery status

The runnable application is complete for offline/demo operation and has been validated with TypeScript, unit tests, a production build, Preview readiness, route manifest checks, desktop screenshots and a mobile screenshot.

External setup remains intentionally explicit: configure Supabase environment variables and auth in the target Supabase project, apply `supabase/migrations/0001_soilnova.sql`, and flash/validate the companion ESP32 BLE integration in `firmware/soilnova_ble_protocol.ino`. Real hardware BLE communication was not tested in this sandbox.
