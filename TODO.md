# SoilNova Smart NPK Analyzer — Delivery Checklist

## 1. Working dashboard and truthful telemetry
- [x] Build a responsive agricultural IoT dashboard with individual cards and live charts for Soil Moisture (%), Temperature (°C), EC, pH, Nitrogen (N), Phosphorus (P), and Potassium (K).
- [x] Show last update timestamp, device status, active session, data quality, and a clear distinction between actual sensor data and simulated demo data.
- [x] Include loading, empty, offline, error, reconnecting, and mobile-responsive states without decorative clutter or fake readings presented as real measurements.

## 2. BLE and firmware protocol
- [x] Implement configurable BLE service and data characteristic UUIDs with Connect, Disconnect, status and live-data indicators.
- [x] Gracefully handle connection errors, disconnections, malformed packets and missing sensor data.
- [x] Document and implement an identical versioned compact binary packet protocol for firmware and frontend within BLE notification limits.
- [x] Include ESP32 integration instructions and clearly identify that real hardware communication has not been tested here.

## 3. Sensor scaling, calibration and soil intelligence
- [x] Preserve the supplied firmware’s seven-register mapping as configurable defaults and do not silently assume unverified units or scaling.
- [x] Provide calibration/scaling settings and configurable crop, soil, growth-stage and reference-range settings with source notes.
- [x] Classify Low, Normal or High only when a reference range is configured; otherwise display “Reference range not configured.”
- [x] Provide deterministic recommendations, warnings and trends, with any optional AI explanation clearly separated from verified agricultural facts.

## 4. Session workflow and archive
- [x] Support Start, Pause, Resume and End session transitions, notes, sample location and unique session IDs.
- [x] Persist every timestamped reading, analysis result and warning event without overwriting prior sessions.
- [x] Calculate minimum, maximum, average and variation for every parameter and show session charts.
- [x] Reopen old sessions, compare multiple sessions, search/filter/sort the archive, and export CSV and JSON.

## 5. Persistence and security
- [x] Include a runnable offline/demo repository and a Supabase-ready persistence adapter.
- [x] Include migrations for profiles, devices, sessions, readings, analysis results, events/alerts and crop/soil reference ranges.
- [x] Include authentication/RLS/ownership checks, validation and indexes in the SQL migration.
- [x] Never expose service-role keys or other secrets in frontend code.

## 6. Pages, tests and delivery
- [x] Implement Overview, Live Monitoring, New Session, Archive, Session Details, Compare, Soil Analysis, Device/BLE Settings, Calibration/Reference Settings, and Account/Data Export views.
- [x] Add `.env.example`, protocol documentation, firmware instructions and a switchable demo mode.
- [x] Add unit tests for packet decoding, scaling, session persistence, archive retrieval and session isolation.
- [x] Run diagnostics, tests, production build, route-manifest verification and Preview checks; fix actionable errors and checkpoint the finished project.


## External validation still required

The app is complete and runnable in demo/offline mode. Supabase credentials/auth setup and real ESP32 BLE flashing/testing remain deployment steps because no external project credentials or hardware were available in this sandbox.
