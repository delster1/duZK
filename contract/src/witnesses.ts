import { Ledger } from './managed/record/contract/index.cjs'
import { WitnessContext } from '@midnight-ntwrk/compact-runtime';

export type RecordPrivateState = {
	readonly patientKey: Uint8Array;
}

export const createRecordPrivateState = (patientKey : Uint8Array) => ({
	patientKey,
});

export const witnesses = {
  patient_secret_key: ({ privateState }: WitnessContext<Ledger, RecordPrivateState>): [RecordPrivateState, Uint8Array] => [
    privateState,
    privateState.patientKey,
  ],
};
