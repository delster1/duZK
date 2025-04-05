pragma language_version >= 0.14.0;

import CompactStandardLibrary;
export enum STATE { empty, filed}
export ledger record_hash: Maybe<Bytes<32>>;
export ledger patient_id  : Bytes<32>
// export ledger doctorPermissions: Maybe<Map<Bytes, String>>; // e.g., "read", "write"

constructor() {
    record_hash = none<Bytes>();
	state = STATE.empty;
	doctorPermissions = none<Map<Bytes, String>>();
}

witness patient_secret_key() : Bytes<32>;

export circuit add_record(new_record_hash: Bytes): [] {
    assert state == STATE.empty
        "Attempted to add record to an already existing record, use update_record instead";
	record_hash = new_record_hash; 
    state = STATE.filed;
}

export circuit update_record(new_record_hash : Bytes) [] {
	assert state == STATE.filled
        "Attempted to add record to an non-existing record, use add_record instead";
	record_hash = new_record_hash;

}

export circuit delete_record() [] {
	assert state == STATE.filled
        "Attempted to delete record a non-existing record";
	record_hash = none<Bytess<32>>;
	state = STATE.empty;
}
