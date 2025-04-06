/**
 * Bulletin board common types and abstractions.
 *
 * @module
 */

import { type MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import { type FoundContract } from '@midnight-ntwrk/midnight-js-contracts';
import type { STATE, RecordPrivateState , Contract, Witnesses } from '@midnight-ntwrk/record-contract';

/**
 * The private states consumed throughout the application.
 *
 * @remarks
 * {@link PrivateStates} can be thought of as a type that describes a schema for all
 * private states for all contracts used in the application. Each key represents
 * the type of private state consumed by a particular type of contract.
 * The key is used by the deployed contract when interacting with a private state provider,
 * and the type (i.e., `typeof PrivateStates[K]`) represents the type of private state
 * expected to be returned.
 *
 * Since there is only one contract type for the bulletin board example, we only define a
 * single key/type in the schema.
 *
 * @public
 */
export type PrivateStates = {
  /**
   * Key used to provide the private state for {@link BBoardContract} deployments.
   */
  readonly RecordPrivateState: RecordPrivateState;
};

/**
 * Represents a bulletin board contract and its private state.
 *
 * @public
 */
export type RecordContract = Contract<RecordPrivateState, Witnesses<RecordPrivateState>>;

/**
 * The keys of the circuits exported from {@link BBoardContract}.
 *
 * @public
 */
export type RecordCircuitKeys = Exclude<keyof RecordContract['impureCircuits'], number | symbol>;

/**
 * The providers required by {@link BBoardContract}.
 *
 * @public
 */
export type RecordProviders = MidnightProviders<RecordCircuitKeys, PrivateStates>;

/**
 * A {@link BBoardContract} that has been deployed to the network.
 *
 * @public
 */
export type DeployedRecordContract = FoundContract<RecordPrivateState, RecordContract>;

/**
 * A type that represents the derived combination of public (or ledger), and private state.
 */
export type RecordDerivedState = {
  readonly state: STATE;
  readonly record_hash: Uint8Array | undefined;
  readonly patient_id: Uint8Array;

  /**
   * A readonly flag that determines if the current message was posted by the current user.
   *
   * @remarks
   * The `poster` property of the public (or ledger) state is the public key of the message poster, while
   * the `secretKey` property of {@link BBoardPrivateState} is the secret key of the current user. If
   * `poster` corresponds to `secretKey`, then `isOwner` is `true`.
   */
  readonly isOwner: boolean;
};

