/**
 * Snapshot test for the serialized passkey credential format.
 *
 * FORMAT STABILITY POLICY
 * ────────────────────────────────────────────────────────────────────────────
 * The three keys stored in localStorage by the SDK:
 *
 *   invisible_wallet_address    — Stellar contract strkey  ("C..." 56 chars)
 *   invisible_wallet_key_id     — hex-encoded credential ID bytes (variable len)
 *   invisible_wallet_public_key — hex-encoded uncompressed P-256 key (130 hex
 *                                 chars = 65 bytes: 0x04 prefix + 32B x + 32B y)
 *
 * These keys and their formats MUST NOT change in any SDK release. Changing
 * them would silently break all existing wallets whose credentials live in
 * their users' localStorage. Any intentional format change requires:
 *   1. A new version number in this fixture file.
 *   2. A migration function that reads the old keys and writes the new keys.
 *   3. A new fixture file (credential-v{N}.json) for the new format.
 *   4. A new test case verifying the migration path.
 * ────────────────────────────────────────────────────────────────────────────
 */

import path from 'path';
import { StrKey } from '@stellar/stellar-sdk';
import { hexToUint8Array, bufferToHex } from '../src/utils';

const FIXTURE_PATH = path.join(__dirname, 'fixtures', 'credential-v1.json');

type CredentialV1 = {
    version: number;
    keys: {
        invisible_wallet_address: string;
        invisible_wallet_key_id: string;
        invisible_wallet_public_key: string;
    };
};

describe('Credential format — v1 stability', () => {
    let fixture: CredentialV1;

    beforeAll(() => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        fixture = require(FIXTURE_PATH) as CredentialV1;
    });

    it('fixture loads and has version 1', () => {
        expect(fixture).toBeDefined();
        expect(fixture.version).toBe(1);
        expect(fixture.keys).toBeDefined();
    });

    it('invisible_wallet_address is a valid Stellar contract address', () => {
        const addr = fixture.keys.invisible_wallet_address;
        expect(typeof addr).toBe('string');
        expect(StrKey.isValidContract(addr)).toBe(true);
        // Stellar contract strkeys are always 56 characters
        expect(addr.length).toBe(56);
        expect(addr[0]).toBe('C');
    });

    it('invisible_wallet_key_id is a valid even-length hex string', () => {
        const keyId = fixture.keys.invisible_wallet_key_id;
        expect(typeof keyId).toBe('string');
        expect(keyId.length % 2).toBe(0);
        expect(/^[0-9a-f]+$/i.test(keyId)).toBe(true);
        // hexToUint8Array must not throw on v1 credential ID
        const bytes = hexToUint8Array(keyId);
        expect(bytes.byteLength).toBe(keyId.length / 2);
    });

    it('invisible_wallet_public_key is a valid uncompressed P-256 key (65 bytes)', () => {
        const hex = fixture.keys.invisible_wallet_public_key;
        expect(typeof hex).toBe('string');
        // 65 bytes → 130 hex chars
        expect(hex.length).toBe(130);
        expect(/^[0-9a-f]+$/i.test(hex)).toBe(true);

        const bytes = hexToUint8Array(hex);
        expect(bytes.byteLength).toBe(65);
        // Uncompressed P-256 key starts with 0x04
        expect(bytes[0]).toBe(0x04);
    });

    it('hex fields survive bufferToHex(hexToUint8Array(hex)) roundtrip', () => {
        const keyId  = fixture.keys.invisible_wallet_key_id.toLowerCase();
        const pubKey = fixture.keys.invisible_wallet_public_key.toLowerCase();

        expect(bufferToHex(hexToUint8Array(keyId))).toBe(keyId);
        expect(bufferToHex(hexToUint8Array(pubKey))).toBe(pubKey);
    });

    it('required storage keys are present and non-empty', () => {
        const REQUIRED_KEYS = [
            'invisible_wallet_address',
            'invisible_wallet_key_id',
            'invisible_wallet_public_key',
        ] as const;

        for (const key of REQUIRED_KEYS) {
            expect(fixture.keys[key]).toBeTruthy();
        }
    });
});
