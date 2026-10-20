# SoilNova SNP1 BLE packet protocol

The frontend and ESP32 companion code use a compact 20-byte notification frame named `SNP1`. It is intentionally legacy-safe for BLE notification payloads and does not rely on a timestamp inside the packet; the receiver timestamps arrival.

| Byte(s) | Field | Encoding |
|---|---|---|
| 0–1 | magic | `0x53 0x4E` (`SN`) |
| 2 | version | `0x01` |
| 3 | flags | bit 0 data valid, bit 1 demo origin, bit 2 calibration warning |
| 4 | sequence | unsigned 8-bit rolling sequence |
| 5–6 | moisture | unsigned big-endian register value |
| 7–8 | temperature | signed big-endian int16 register value |
| 9–10 | EC | unsigned big-endian register value |
| 11–12 | pH | unsigned big-endian register value |
| 13–14 | nitrogen | unsigned big-endian register value |
| 15–16 | phosphorus | unsigned big-endian register value |
| 17–18 | potassium | unsigned big-endian register value |
| 19 | CRC-8 | polynomial `0x07`, initial `0x00`, bytes 0–18 |

The supplied firmware currently reads Modbus registers 0 through 6. SoilNova maps them in that same order. The current UI calibration defaults divide moisture, temperature and pH by 10, while leaving EC and nutrients raw. These are provenance-labelled defaults derived from the supplied sketch, not verified sensor-datasheet claims.

The decoder rejects the frame when its length, magic, version or CRC is wrong. A packet with data-valid bit 0 is accepted for diagnostics but should be treated as a missing sensor reading by a production ingestion policy. Unknown versions should be rejected rather than guessed.

The default GATT identifiers are:

```text
Service:        8f2a1000-6b4d-4c9a-8d31-1e2a3b4c5d60
Characteristic: 8f2a1001-6b4d-4c9a-8d31-1e2a3b4c5d60
```

They are editable under Device & BLE settings because the supplied firmware did not yet implement BLE.
