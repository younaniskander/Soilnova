#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#define BLE_SERVICE_UUID "8f2a1000-6b4d-4c9a-8d31-1e2a3b4c5d60"
#define BLE_CHARACTERISTIC_UUID "8f2a1001-6b4d-4c9a-8d31-1e2a3b4c5d60"

BLECharacteristic *soilNovaCharacteristic = nullptr;
volatile bool soilNovaClientConnected = false;
uint8_t soilNovaSequence = 0;

class SoilNovaServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer*) override { soilNovaClientConnected = true; }
  void onDisconnect(BLEServer *server) override {
    soilNovaClientConnected = false;
    server->startAdvertising();
  }
};

uint8_t soilNovaCrc8(const uint8_t *data, size_t length) {
  uint8_t crc = 0;
  for (size_t i = 0; i < length; i++) {
    crc ^= data[i];
    for (uint8_t bit = 0; bit < 8; bit++) crc = (crc & 0x80) ? (uint8_t)((crc << 1) ^ 0x07) : (uint8_t)(crc << 1);
  }
  return crc;
}

void soilNovaPutU16(uint8_t *packet, uint8_t offset, uint16_t value) {
  packet[offset] = (uint8_t)(value >> 8);
  packet[offset + 1] = (uint8_t)(value & 0xff);
}

void soilNovaBleBegin() {
  BLEDevice::init("SoilNova ESP32");
  BLEServer *server = BLEDevice::createServer();
  server->setCallbacks(new SoilNovaServerCallbacks());
  BLEService *service = server->createService(BLE_SERVICE_UUID);
  soilNovaCharacteristic = service->createCharacteristic(BLE_CHARACTERISTIC_UUID, BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY);
  soilNovaCharacteristic->addDescriptor(new BLE2902());
  service->start();
  server->getAdvertising()->addServiceUUID(BLE_SERVICE_UUID);
  server->getAdvertising()->start();
}

// Call only after the existing Modbus CRC/header validation succeeds.
void soilNovaBleNotify(uint16_t humidity, int16_t temperature, uint16_t conductivity, uint16_t ph, uint16_t nitrogen, uint16_t phosphorus, uint16_t potassium, bool demo = false, bool calibrationWarning = true) {
  if (!soilNovaCharacteristic || !soilNovaClientConnected) return;
  uint8_t packet[20] = {0x53, 0x4e, 0x01, (uint8_t)(0x01 | (demo ? 0x02 : 0x00) | (calibrationWarning ? 0x04 : 0x00)), soilNovaSequence++};
  soilNovaPutU16(packet, 5, humidity);
  soilNovaPutU16(packet, 7, (uint16_t)temperature);
  soilNovaPutU16(packet, 9, conductivity);
  soilNovaPutU16(packet, 11, ph);
  soilNovaPutU16(packet, 13, nitrogen);
  soilNovaPutU16(packet, 15, phosphorus);
  soilNovaPutU16(packet, 17, potassium);
  packet[19] = soilNovaCrc8(packet, 19);
  soilNovaCharacteristic->setValue(packet, sizeof(packet));
  soilNovaCharacteristic->notify();
}
