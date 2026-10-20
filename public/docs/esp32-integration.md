# ESP32 integration

The supplied sketch already reads the seven Modbus registers and renders them on the OLED. It does not implement BLE. Add the companion code in `firmware/soilnova_ble_protocol.ino` to the same project or merge its CRC8, BLE service setup and packet-notification function into the existing sketch.

## Hardware and library setup

Keep the existing RS485/OLED wiring and add no new sensor assumptions. Install an ESP32 board package that provides `BLEDevice`, `BLEServer`, `BLECharacteristic` and `BLE2902`. The device advertises the SoilNova service UUID and notifies the data characteristic when a valid Modbus response has been decoded.

## Integration points

1. Define `BLE_SERVICE_UUID` and `BLE_CHARACTERISTIC_UUID` using the values in the protocol document.
2. Call `soilNovaBleBegin()` in `setup()` after serial/OLED initialization.
3. After the existing `readNPK(response)` succeeds and the seven registers have been extracted, call `soilNovaBleNotify(humidity, temperature, conductivity, ph, nitrogen, phosphorus, potassium)`.
4. Increment the sequence byte for each notification. Set bit 0 in flags only when the Modbus response passed its length/header/CRC checks.
5. If the BLE client disconnects, keep reading the OLED/RS485 path; advertising resumes automatically through the helper callbacks.

Real hardware communication was not tested in this environment. Validate the sensor register map, units, wire direction control, BLE advertising and browser compatibility on the target board before treating readings as agronomic measurements.
