import type { ReadingValues } from './domain';

export const SNP1_MAGIC = [0x53, 0x4e] as const;
export const SNP1_VERSION = 1;
export const SNP1_PACKET_LENGTH = 20;
export const DEFAULT_SERVICE_UUID = '8f2a1000-6b4d-4c9a-8d31-1e2a3b4c5d60';
export const DEFAULT_CHARACTERISTIC_UUID = '8f2a1001-6b4d-4c9a-8d31-1e2a3b4c5d60';

export interface DecodedPacket { version: number; flags: number; sequence: number; raw: ReadingValues; dataValid: boolean; isDemo: boolean; calibrationWarning: boolean; }
export type ProtocolResult = { ok: true; packet: DecodedPacket } | { ok: false; error: string };
