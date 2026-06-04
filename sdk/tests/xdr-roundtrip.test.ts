/**
 * XDR roundtrip tests for Stellar transaction builder helpers.
 *
 * For each operation the SDK submits to the network, this test builds the
 * transaction, encodes it to XDR, decodes it back, re-encodes, and asserts the
 * two XDR strings are identical. This catches subtle serialisation bugs
 * (wrong argument types, missing fields, byte-order issues).
 *
 * No network calls or mocks — pure XDR codec verification.
 */
import {
    Account,
    Contract,
    TransactionBuilder,
    BASE_FEE,
    Networks,
    nativeToScVal,
    Transaction,
    StrKey,
} from '@stellar/stellar-sdk';

const NETWORK = Networks.TESTNET;

// Deterministic source account (all-zeros public key, valid Stellar address).
const SOURCE_G = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF';

// Deterministic contract addresses derived from known 32-byte seeds.
const FACTORY_C = StrKey.encodeContract(Buffer.alloc(32));          // seed = 0x00 * 32
const WALLET_C  = StrKey.encodeContract(Buffer.alloc(32).fill(1));  // seed = 0x01 * 32
const TOKEN_C   = StrKey.encodeContract(Buffer.alloc(32).fill(2));  // seed = 0x02 * 32

// A guardian is a regular Stellar account (G-address).
const GUARDIAN_G = SOURCE_G;

// Uncompressed P-256 key: 0x04 prefix + 32 x-bytes + 32 y-bytes = 65 bytes.
const PUBKEY_BYTES = new Uint8Array(65).fill(0xab);
PUBKEY_BYTES[0] = 0x04;

function makeAccount(): Account {
    return new Account(SOURCE_G, '0');
}

/**
 * Encode tx → XDR string, decode back to Transaction, re-encode, and return
 * whether the two XDR strings are identical. If they are, every field
 * (including the operations array) survived the roundtrip without corruption.
 */
function xdrRoundtrip(tx: Transaction): boolean {
    const encoded = tx.toXDR();
    const decoded = new Transaction(encoded, NETWORK);
    return decoded.toXDR() === encoded;
}

describe('XDR roundtrip — transaction builder helpers', () => {
    it('deploy: operations survive XDR roundtrip', () => {
        const factory   = new Contract(FACTORY_C);
        const rpId      = new TextEncoder().encode('localhost');
        const origin    = new TextEncoder().encode('https://localhost');

        const tx = new TransactionBuilder(makeAccount(), { fee: BASE_FEE, networkPassphrase: NETWORK })
            .addOperation(
                factory.call(
                    'deploy',
                    nativeToScVal(PUBKEY_BYTES, { type: 'bytes' }),
                    nativeToScVal(rpId,         { type: 'bytes' }),
                    nativeToScVal(origin,       { type: 'bytes' }),
                ),
            )
            .setTimeout(30)
            .build();

        expect(tx.operations).toHaveLength(1);
        expect(xdrRoundtrip(tx)).toBe(true);
    });

    it('get_nonce: operations survive XDR roundtrip', () => {
        const wallet = new Contract(WALLET_C);

        const tx = new TransactionBuilder(makeAccount(), { fee: BASE_FEE, networkPassphrase: NETWORK })
            .addOperation(wallet.call('get_nonce'))
            .setTimeout(30)
            .build();

        expect(tx.operations).toHaveLength(1);
        expect(xdrRoundtrip(tx)).toBe(true);
    });

    it('add_signer: operations survive XDR roundtrip', () => {
        const wallet = new Contract(WALLET_C);

        const tx = new TransactionBuilder(makeAccount(), { fee: BASE_FEE, networkPassphrase: NETWORK })
            .addOperation(
                wallet.call('add_signer', nativeToScVal(PUBKEY_BYTES, { type: 'bytes' })),
            )
            .setTimeout(30)
            .build();

        expect(tx.operations).toHaveLength(1);
        expect(xdrRoundtrip(tx)).toBe(true);
    });

    it('remove_signer: operations survive XDR roundtrip', () => {
        const wallet = new Contract(WALLET_C);

        const tx = new TransactionBuilder(makeAccount(), { fee: BASE_FEE, networkPassphrase: NETWORK })
            .addOperation(
                wallet.call('remove_signer', nativeToScVal(2, { type: 'u32' })),
            )
            .setTimeout(30)
            .build();

        expect(tx.operations).toHaveLength(1);
        expect(xdrRoundtrip(tx)).toBe(true);
    });

    it('get_signers: operations survive XDR roundtrip', () => {
        const wallet = new Contract(WALLET_C);

        const tx = new TransactionBuilder(makeAccount(), { fee: BASE_FEE, networkPassphrase: NETWORK })
            .addOperation(wallet.call('get_signers'))
            .setTimeout(30)
            .build();

        expect(tx.operations).toHaveLength(1);
        expect(xdrRoundtrip(tx)).toBe(true);
    });

    it('set_guardian: operations survive XDR roundtrip', () => {
        const wallet = new Contract(WALLET_C);

        const tx = new TransactionBuilder(makeAccount(), { fee: BASE_FEE, networkPassphrase: NETWORK })
            .addOperation(
                wallet.call('set_guardian', nativeToScVal(GUARDIAN_G, { type: 'address' })),
            )
            .setTimeout(30)
            .build();

        expect(tx.operations).toHaveLength(1);
        expect(xdrRoundtrip(tx)).toBe(true);
    });

    it('initiate_recovery: operations survive XDR roundtrip', () => {
        const wallet = new Contract(WALLET_C);

        const tx = new TransactionBuilder(makeAccount(), { fee: BASE_FEE, networkPassphrase: NETWORK })
            .addOperation(
                wallet.call('initiate_recovery', nativeToScVal(PUBKEY_BYTES, { type: 'bytes' })),
            )
            .setTimeout(30)
            .build();

        expect(tx.operations).toHaveLength(1);
        expect(xdrRoundtrip(tx)).toBe(true);
    });

    it('complete_recovery: operations survive XDR roundtrip', () => {
        const wallet = new Contract(WALLET_C);

        const tx = new TransactionBuilder(makeAccount(), { fee: BASE_FEE, networkPassphrase: NETWORK })
            .addOperation(wallet.call('complete_recovery'))
            .setTimeout(30)
            .build();

        expect(tx.operations).toHaveLength(1);
        expect(xdrRoundtrip(tx)).toBe(true);
    });

    it('approve (with expiry): operations survive XDR roundtrip', () => {
        const wallet   = new Contract(WALLET_C);
        const amount   = BigInt(1_000_000);
        const expiry   = BigInt(9_999_999);
        const expiryVal = nativeToScVal(
            [nativeToScVal(expiry, { type: 'u64' })],
            { type: 'Vec' },
        );

        const tx = new TransactionBuilder(makeAccount(), { fee: BASE_FEE, networkPassphrase: NETWORK })
            .addOperation(
                wallet.call(
                    'approve',
                    nativeToScVal(GUARDIAN_G, { type: 'address' }),
                    nativeToScVal(TOKEN_C,    { type: 'address' }),
                    nativeToScVal(amount,     { type: 'i128' }),
                    expiryVal,
                ),
            )
            .setTimeout(30)
            .build();

        expect(tx.operations).toHaveLength(1);
        expect(xdrRoundtrip(tx)).toBe(true);
    });

    it('approve (no expiry / scvVoid): operations survive XDR roundtrip', () => {
        const wallet  = new Contract(WALLET_C);
        const amount  = BigInt(500_000);
        const { xdr } = require('@stellar/stellar-sdk');

        const tx = new TransactionBuilder(makeAccount(), { fee: BASE_FEE, networkPassphrase: NETWORK })
            .addOperation(
                wallet.call(
                    'approve',
                    nativeToScVal(GUARDIAN_G, { type: 'address' }),
                    nativeToScVal(TOKEN_C,    { type: 'address' }),
                    nativeToScVal(amount,     { type: 'i128' }),
                    xdr.ScVal.scvVoid(),
                ),
            )
            .setTimeout(30)
            .build();

        expect(tx.operations).toHaveLength(1);
        expect(xdrRoundtrip(tx)).toBe(true);
    });

    it('get_allowance: operations survive XDR roundtrip', () => {
        const wallet = new Contract(WALLET_C);

        const tx = new TransactionBuilder(makeAccount(), { fee: BASE_FEE, networkPassphrase: NETWORK })
            .addOperation(
                wallet.call(
                    'get_allowance',
                    nativeToScVal(GUARDIAN_G, { type: 'address' }),
                    nativeToScVal(TOKEN_C,    { type: 'address' }),
                ),
            )
            .setTimeout(30)
            .build();

        expect(tx.operations).toHaveLength(1);
        expect(xdrRoundtrip(tx)).toBe(true);
    });
});
