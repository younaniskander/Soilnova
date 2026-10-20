# SoilNova Smart NPK Analyzer — Implementation Plan

## Scope
Build a working responsive web application for an ESP32-based Smart NPK Soil Analyzer. The app will provide a polished scientific dashboard, configurable Web Bluetooth integration, session capture and archive, deterministic soil analysis, comparisons and exports, settings, a switchable demo mode, Supabase-ready persistence, and firmware protocol documentation. It will not claim that real BLE hardware communication has been tested in this environment.

## Implementation approach

- **Frontend:** React + TypeScript + Vite with Tailwind CSS and Recharts. A route-aware single-page shell will provide the ten requested product areas without making the dashboard feel like a generic admin template.
- **Persistence:** A typed repository abstraction will use local browser storage for immediately runnable demo/offline behavior. A Supabase adapter and SQL migrations will be included for authenticated permanent storage when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured. No service-role key will be shipped to the browser.
- **BLE:** A configurable service/characteristic adapter will use the Web Bluetooth API. The documented `SNP1` versioned binary packet will carry seven signed/unsigned values and quality flags within notification limits. The decoder will reject malformed length, magic, version, CRC and unknown-field packets with user-visible error state.
- **Sensor truthfulness:** Register locations and the apparent scales from the supplied firmware will be represented as configurable defaults marked “provided firmware mapping; verify with datasheet”. Reference classifications remain unavailable until a reference range is configured. Demo data is visually labelled and can be disabled.
- **Sessions:** A session store will append timestamped readings rather than overwrite them; calculate min/max/average/variation; preserve alerts and analysis snapshots; support pause/resume/end, archive search and sort, details, comparison, CSV and JSON exports.
- **Analysis:** Deterministic rules will classify configured reference ranges and generate recommendations with source notes. AI explanation is optional and clearly labelled as explanatory, not agronomic verification.
- **Documentation:** Include `.env.example`, Supabase schema/migration/RLS SQL, BLE packet protocol, ESP32 integration instructions and firmware reference implementation additions.
- **Validation:** Configure host TypeScript diagnostics before code edits, run typecheck/build/tests, verify `/manus-routes.json`, start Preview on port 3000, inspect key views and checkpoint the completed project.

## Project structure

- `src/app/` — app shell, navigation, route view state and global UI primitives.
- `src/components/` — reusable metric cards, charts, status pills, session tables, forms and overlays.
- `src/features/` — dashboard, monitoring, sessions, analysis, comparison and settings view modules.
- `src/hooks/` — application state, BLE and responsive behavior hooks.
- `src/lib/` — protocol decoder, scaling/calibration, analysis rules, export helpers and storage repository.
- `src/types/` — domain and protocol types.
- `supabase/migrations/` — database schema, indexes, triggers and RLS policies.
- `firmware/` — BLE protocol reference integration for the supplied ESP32 Modbus/OLED firmware.
- `tests/` — decoder, scaling, session persistence and ownership-isolation tests.
- `public/manus-routes.json` — complete route manifest.

## Design direction

Three candidate directions were considered: **Field Lab Journal** (0.07), **Canopy Instrument** (0.06), and **Quiet Agronomy** (0.08). The selected direction is **Canopy Instrument**.

- **Design Movement:** modern agricultural instrumentation: editorial field notes, dark green data ink, and restrained scientific UI.
- **Core Principles:** make sensor truth visible; prioritize scanning over decoration; use configuration instead of assumptions; make every action reversible or explicit.
- **Color Philosophy:** warm paper and mineral neutrals keep the interface grounded in fieldwork, while deep forest green signals verified action and a bright chlorophyll accent marks live telemetry. Amber and coral are reserved for attention states.
- **Layout Paradigm:** an offset two-column workspace with a persistent measurement rail and contextual panels rather than a centered card grid.
- **Signature Elements:** a “signal line” motif for live status, compact measurement readouts with unit provenance, and field-note style session metadata.
- **Interaction Philosophy:** controls should explain state changes in place; demo/live and connected/disconnected states are always explicit.
- **Animation:** brief opacity/translate transitions for view changes and live update pulses only; no looping decorative motion.
- **Typography System:** Inter for data/UI with a slightly editorial display treatment using the same family at strong weight and generous tracking; monospace is reserved for protocol IDs and timestamps.
- **Brand Essence:** a field-ready soil intelligence console for growers and technicians who need readings they can trust; measured, clear, grounded.
- **Brand Voice:** direct and evidence-aware. Example lines: “The sensor is quiet; the archive is not.” and “Configure a reference before calling this normal.”
- **Wordmark & Logo:** a simple leaf-canopy glyph intersected by a seven-node signal path, paired with the SoilNova wordmark.
- **Signature Brand Color:** deep forest `#173F35`.

## Build workflow

1. Create the task checklist and scaffold source files.
2. Configure TypeScript diagnostics and install only required project dependencies.
3. Implement domain types, protocol decoder, scaling, repository, session/analysis logic and tests.
4. Implement the shell and responsive views, then connect state and exports.
5. Add migrations, firmware documentation, environment template and route manifest.
6. Run diagnostics, typecheck, unit tests and production build; fix confirmed issues.
7. Start the dev server, verify the route manifest and inspect the dashboard on desktop and mobile.
8. Commit the completed project to the canonical WebDev repository and report any remaining external setup (Supabase credentials and ESP32 BLE firmware upload).
