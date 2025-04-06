import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export enum STATE { filled = 0, empty = 1 }

export type Witnesses<T> = {
  patient_secret_key(context: __compactRuntime.WitnessContext<Ledger, T>): [T, Uint8Array];
}

export type ImpureCircuits<T> = {
  add_patient_and_record(context: __compactRuntime.CircuitContext<T>,
                         new_record_hash_0: Uint8Array,
                         new_patient_id_0: Uint8Array): __compactRuntime.CircuitResults<T, []>;
}

export type PureCircuits = {
  public_key(sk_0: Uint8Array, instance_0: Uint8Array): Uint8Array;
}

export type Circuits<T> = {
  add_patient_and_record(context: __compactRuntime.CircuitContext<T>,
                         new_record_hash_0: Uint8Array,
                         new_patient_id_0: Uint8Array): __compactRuntime.CircuitResults<T, []>;
  public_key(context: __compactRuntime.CircuitContext<T>,
             sk_0: Uint8Array,
             instance_0: Uint8Array): __compactRuntime.CircuitResults<T, Uint8Array>;
}

export type Ledger = {
  readonly state: STATE;
  readonly recordHash: { is_some: boolean, value: Uint8Array };
  readonly instance: bigint;
  readonly patient: Uint8Array;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<T, W extends Witnesses<T> = Witnesses<T>> {
  witnesses: W;
  circuits: Circuits<T>;
  impureCircuits: ImpureCircuits<T>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<T>): __compactRuntime.ConstructorResult<T>;
}

export declare function ledger(state: __compactRuntime.StateValue): Ledger;
export declare const pureCircuits: PureCircuits;
