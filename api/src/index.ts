/**
 * Provides types and utilities for working with bulletin board contracts.
 *
 * @packageDocumentation
 */

import { type ContractAddress, convert_bigint_to_Uint8Array } from '@midnight-ntwrk/compact-runtime';
import { type Logger } from 'pino';
import type { RecordDerivedState, RecordContract, RecordProviders, DeployedRecordContract } from './common-types.js';
import {
	type RecordPrivateState,
	Contract,
	createRecordPrivateState,
	ledger,
	pureCircuits,
	witnesses,
	STATE,
} from '@midnight-ntwrk/record-contract';
import * as utils from './utils/index.js';
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { combineLatest, map, tap, from, type Observable } from 'rxjs';
import { toHex } from '@midnight-ntwrk/midnight-js-utils';

/** @internal */
const recordContractInstance: RecordContract = new Contract(witnesses);

/**
 * An API for a deployed bulletin board.
 */
export interface DeployedRecordAPI {
	readonly deployedContractAddress: ContractAddress;
	readonly state$: Observable<RecordDerivedState>;

	add_patient_and_record: (new_record_hash : Uint8Array) => Promise<void>;
	update_record: (new_record_hash : Uint8Array) => Promise<void>;
	delete_record: () => Promise<void>;
}

/**
 * Provides an implementation of {@link DeployedBBoardAPI} by adapting a deployed bulletin board
 * contract.
 *
 * @remarks
 * The `BBoardPrivateState` is managed at the DApp level by a private state provider. As such, this
 * private state is shared between all instances of {@link BBoardAPI}, and their underlying deployed
 * contracts. The private state defines a `'secretKey'` property that effectively identifies the current
 * user, and is used to determine if the current user is the poster of the message as the observable
 * contract state changes.
 *
 * In the future, Midnight.js will provide a private state provider that supports private state storage
 * keyed by contract address. This will remove the current workaround of sharing private state across
 * the deployed bulletin board contracts, and allows for a unique secret key to be generated for each bulletin
 * board that the user interacts with.
 */
// TODO: Update BBoardAPI to use contract level private state storage.
export class RecordAPI implements DeployedRecordAPI {
	/** @internal */
	private constructor(
		public readonly deployedContract: DeployedRecordContract,
		providers: RecordProviders,
		private readonly logger?: Logger,
	) {
		this.deployedContractAddress = deployedContract.deployTxData.public.contractAddress;
		this.state$ = combineLatest(
			[
				// Combine public (ledger) state with...
				providers.publicDataProvider.contractStateObservable(this.deployedContractAddress, { type: 'latest' }).pipe(
					map((contractState) => ledger(contractState.data)),
					tap((ledgerState) =>
						logger?.trace({
							ledgerStateChanged: {
								ledgerState: {
									...ledgerState,
									state: ledgerState.state === STATE.filed ? 'occupied' : 'vacant',
									patient_id: toHex(ledgerState.patientId),
								},
							},
						}),
					),
				),
				// ...private state...
				//    since the private state of the bulletin board application never changes, we can query the
				//    private state once and always use the same value with `combineLatest`. In applications
				//    where the private state is expected to change, we would need to make this an `Observable`.
				from(providers.privateStateProvider.get('RecordPrivateState') as Promise<RecordPrivateState>),
			],
			// ...and combine them to produce the required derived state.
			(ledgerState, privateState) => {
				const hashedSecretKey = pureCircuits.public_key(
					privateState.patientKey,
					ledgerState.recordHash
				);

				return {
					state: ledgerState.state,
					record_hash: ledgerState.recordHash,
					isOwner: toHex(ledgerState.patientId) === toHex(hashedSecretKey),
					patient_id : ledgerState.patientId
				};
			},
		);
	}

	/**
	 * Gets the address of the current deployed contract.
	 */
	readonly deployedContractAddress: ContractAddress;

	/**
	 * Gets an observable stream of state changes based on the current public (ledger),
	 * and private state data.
	 */
	readonly state$: Observable<RecordDerivedState>;

	/**
	 * Attempts to post a given message to the bulletin board.
	 *
	 * @param message The message to post.
	 *
	 * @remarks
	 * This method can fail during local circuit execution if the bulletin board is currently occupied.
	 */
	async update_record(new_record_hash: Uint8Array): Promise<void> {
		this.logger?.info(`updating record: ${new_record_hash}`);

		const txData =
			// EXERCISE 3: CALL THE post CIRCUIT AND SUBMIT THE TRANSACTION TO THE NETWORK
			await this.deployedContract.callTx // EXERCISE ANSWER
				.update_record(new_record_hash); // EXERCISE ANSWER

		this.logger?.trace({
			transactionAdded: {
				circuit: 'update_record',
				txHash: txData.public.txHash,
				blockHeight: txData.public.blockHeight,
			},
		});
	}

	async add_patient_and_record(new_record_hash: Uint8Array): Promise<void> {
		this.logger?.info(`updating record: ${new_record_hash}`);

		const txData =
			// EXERCISE 3: CALL THE post CIRCUIT AND SUBMIT THE TRANSACTION TO THE NETWORK
			await this.deployedContract.callTx // EXERCISE ANSWER
				.add_patient_and_record(new_record_hash); // EXERCISE ANSWER

		this.logger?.trace({
			transactionAdded: {
				circuit: 'add_patient_and_record',
				txHash: txData.public.txHash,
				blockHeight: txData.public.blockHeight,
			},
		});
	}

	/**
	 * Attempts to take down any currently posted message on the bulletin board.
	 *
	 * @remarks
	 * This method can fail during local circuit execution if the bulletin board is currently vacant,
	 * or if the currently posted message isn't owned by the poster computed from the current private
	 * state.
	 */
	async delete_record(): Promise<void> {
		this.logger?.info('takingDownMessage');

		const txData =
			// EXERCISE 4: CALL THE take_down CIRCUIT AND SUBMIT THE TRANSACTION TO THE NETWORK
			await this.deployedContract.callTx // EXERCISE ANSWER
				.delete_record(); // EXERCISE ANSWER

		this.logger?.trace({
			transactionAdded: {
				circuit: 'delete_record',
				txHash: txData.public.txHash,
				blockHeight: txData.public.blockHeight,
			},
		});
	}

	/**
	 * Deploys a new bulletin board contract to the network.
	 *
	 * @param providers The bulletin board providers.
	 * @param logger An optional 'pino' logger to use for logging.
	 * @returns A `Promise` that resolves with a {@link BBoardAPI} instance that manages the newly deployed
	 * {@link DeployedBBoardContract}; or rejects with a deployment error.
	 */
	static async deploy(providers: RecordProviders, logger?: Logger): Promise<RecordAPI> {
		logger?.info('deployContract');

		// EXERCISE 5: FILL IN THE CORRECT ARGUMENTS TO deployContract
		const deployedRecordContract = await deployContract(providers, {
			// EXERCISE ANSWER
			privateStateKey: 'RecordPrivateState', // EXERCISE ANSWER
			contract: recordContractInstance,
			initialPrivateState: await RecordAPI.getPrivateState(providers), // EXERCISE ANSWER
		});

		logger?.trace({
			contractDeployed: {
				finalizedDeployTxData: deployedRecordContract.deployTxData.public,
			},
		});

		return new RecordAPI(deployedRecordContract, providers, logger);
	}

	/**
	 * Finds an already deployed bulletin board contract on the network, and joins it.
	 *
	 * @param providers The bulletin board providers.
	 * @param contractAddress The contract address of the deployed bulletin board contract to search for and join.
	 * @param logger An optional 'pino' logger to use for logging.
	 * @returns A `Promise` that resolves with a {@link BBoardAPI} instance that manages the joined
	 * {@link DeployedBBoardContract}; or rejects with an error.
	 */
	static async join(providers: RecordProviders, contractAddress: ContractAddress, logger?: Logger): Promise<RecordAPI> {
		logger?.info({
			joinContract: {
				contractAddress,
			},
		});

		const deployedRecordContract = await findDeployedContract(providers, {
			contractAddress,
			contract: recordContractInstance,
			privateStateKey: 'RecordPrivateState',
			initialPrivateState: await RecordAPI.getPrivateState(providers),
		});

		logger?.trace({
			contractJoined: {
				finalizedDeployTxData: deployedRecordContract.deployTxData.public,
			},
		});

		return new RecordAPI(deployedRecordContract, providers, logger);
	}

	private static async getPrivateState(providers: RecordProviders): Promise<RecordPrivateState> {
		const existingPrivateState = await providers.privateStateProvider.get('RecordPrivateState');
		return existingPrivateState ?? createRecordPrivateState(utils.randomBytes(32));
	}
}

/**
 * A namespace that represents the exports from the `'utils'` sub-package.
 *
 * @public
 */
export * as utils from './utils/index.js';

export * from './common-types.js';

