import { PARAMETER_KEYS, type ReadingValues } from '../types/domain';
import { SNP1_MAGIC, SNP1_PACKET_LENGTH, SNP1_VERSION, type DecodedPacket, type ProtocolResult } from '../types/protocol';

export function crc8(bytes: Uint8Array): number {
  let crc = 0;
  for (const value of bytes) {
    crc ^= value;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc & 0x80) !== 0 ? ((crc << 1) ^ 0x07) & 0xff : (crc << 1) & 0xff;
  }
  return crc;
}

function uint16(bytes: Uint8Array, index: number): number { return (bytes[index] << 8) | bytes[index + 1]; }
function int16(bytes: Uint8Array, index: number): number { const value = uint16(bytes, index); return value & 0x8000 ? value - 0x10000 : value; }

export function decodeSnp1(input: ArrayBuffer | Uint8Array): ProtocolResult {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (bytes.length !== SNP1_PACKET_LENGTH) return { ok: false, error: `Expected ${SNP1_PACKET_LENGTH} bytes, received ${bytes.length}.` };
  if (bytes[0] !== SNP1_MAGIC[0] || bytes[1] !== SNP1_MAGIC[1]) return { ok: false, error: 'Packet magic mismatch. Expected SNP1.' };
  if (bytes[2] !== SNP1_VERSION) return { ok: false, error: `Unsupported packet version ${bytes[2]}.` };
  if ((bytes[3] & 0xf8) !== 0) return { ok: false, error: 'Packet contains unknown flags.' };
  if (crc8(bytes.slice(0, -1)) !== bytes[bytes.length - 1]) return { ok: false, error: 'Packet CRC-8 validation failed.' };
  const raw: ReadingValues = {
    moisture: uint16(bytes, 5), temperature: int16(bytes, 7), ec: uint16(bytes, 9), ph: uint16(bytes, 11),
    nitrogen: uint16(bytes, 13), phosphorus: uint16(bytes, 15), potassium: uint16(bytes, 17),
  };
  const flags = bytes[3];
  const packet: DecodedPacket = { version: bytes[2], flags, sequence: bytes[4], raw, dataValid: (flags & 0x01) === 0x01, isDemo: (flags & 0x02) === 0x02, calibrationWarning: (flags & 0x04) === 0x04 };
  return { ok: true, packet };
}

export function encodeSnp1(raw: ReadingValues, sequence = 0, flags = 0x01): Uint8Array {
  const bytes = new Uint8Array(SNP1_PACKET_LENGTH);
  bytes[0] = SNP1_MAGIC[0]; bytes[1] = SNP1_MAGIC[1]; bytes[2] = SNP1_VERSION; bytes[3] = flags; bytes[4] = sequence & 0xff;
  PARAMETER_KEYS.forEach((key, index) => { const value = raw[key] & 0xffff; const offset = 5 + index * 2; bytes[offset] = value >> 8; bytes[offset + 1] = value & 0xff; });
  bytes[19] = crc8(bytes.slice(0, -1));
  return bytes;
}
