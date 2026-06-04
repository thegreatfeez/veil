/**
 * Type-level tests for the Invisible Wallet SDK.
 *
 * Run with: npm run test-d
 * These are analysed statically by tsd — they never execute at runtime.
 * A failing expectation here means a type-level regression was introduced.
 */
import { expectType, expectError, expectAssignable } from 'tsd';

import type {
    WalletConfig,
    RegisterResult,
    DeployResult,
    AddSignerResult,
    SignerInfo,
    InitiateRecoveryResult,
    StorageAdapter,
    WebAuthnSignature,
    RecoveryTimelockActive,
    NoGuardianSet,
    RecoveryNotPending,
} from '../src/useInvisibleWallet';

// ── WalletConfig ──────────────────────────────────────────────────────────────

declare const cfg: WalletConfig;

expectType<string>(cfg.factoryAddress);
expectType<string>(cfg.rpcUrl);
expectType<string>(cfg.networkPassphrase);
expectType<string | undefined>(cfg.rpId);
expectType<string | undefined>(cfg.origin);
expectType<StorageAdapter | undefined>(cfg.storage);

// Required fields must not be omitted.
expectError<WalletConfig>({ rpcUrl: 'x', networkPassphrase: 'x' });          // missing factoryAddress
expectError<WalletConfig>({ factoryAddress: 'x', networkPassphrase: 'x' });  // missing rpcUrl
expectError<WalletConfig>({ factoryAddress: 'x', rpcUrl: 'x' });             // missing networkPassphrase

// ── StorageAdapter ────────────────────────────────────────────────────────────

declare const adapter: StorageAdapter;

expectType<string | null | Promise<string | null>>(adapter.getItem('key'));

// A plain localStorage-shaped object satisfies StorageAdapter.
const syncAdapter = {
    getItem:  (_k: string) => null as string | null,
    setItem:  (_k: string, _v: string) => {},
    removeItem: (_k: string) => {},
};
expectAssignable<StorageAdapter>(syncAdapter);

// ── RegisterResult ────────────────────────────────────────────────────────────

declare const reg: RegisterResult;

expectType<string>(reg.walletAddress);
expectType<Uint8Array>(reg.publicKeyBytes);

// ── DeployResult ──────────────────────────────────────────────────────────────

declare const dep: DeployResult;

expectType<string>(dep.walletAddress);
expectType<boolean>(dep.alreadyDeployed);

// ── AddSignerResult ───────────────────────────────────────────────────────────

declare const addSig: AddSignerResult;

expectType<number>(addSig.signerIndex);

// ── SignerInfo ────────────────────────────────────────────────────────────────

declare const info: SignerInfo;

expectType<number>(info.index);
expectType<string>(info.publicKey);

// ── InitiateRecoveryResult ────────────────────────────────────────────────────

declare const ir: InitiateRecoveryResult;

expectType<number>(ir.unlockTime);

// ── WebAuthnSignature ─────────────────────────────────────────────────────────

declare const sig: WebAuthnSignature;

expectType<Uint8Array>(sig.publicKey);
expectType<Uint8Array>(sig.authData);
expectType<Uint8Array>(sig.clientDataJSON);
expectType<Uint8Array>(sig.signature);

// ── Error classes ─────────────────────────────────────────────────────────────

declare const timelockErr: RecoveryTimelockActive;
expectType<number>(timelockErr.unlockTime);
expectAssignable<Error>(timelockErr);

declare const noGuardianErr: NoGuardianSet;
expectAssignable<Error>(noGuardianErr);

declare const notPendingErr: RecoveryNotPending;
expectAssignable<Error>(notPendingErr);
