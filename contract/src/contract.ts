pragma language_version >= 0.14.0;

import CompactStandardLibrary;

export enum STATE { empty, filed}

export ledger state : STATE;
export ledger record_hash: Maybe<Bytes<32>>;
export ledger patient_id  : Bytes<32>;
export ledger stupid : Counter;

constructor() {
    record_hash = none<Bytes<32>>();
    state = STATE.empty;
	stupid.increment(1);
    // doctorPermissions = none<Map<Bytes<32>, String>>(); // Removed as it's not declared as ledger
}

witness patient_secret_key() : Bytes<32>;

export circuit add_patient_and_record(new_record_hash: Bytes<32>, patient_id : Bytes<32>): [] {
    assert state == STATE.empty
        "Attempted to add record to an already existing record, use update_record instead";
    record_hash = some<Bytes<32>>(new_record_hash);
    state = STATE.filed;
	patient_id = disclose(public_key(patient_secret_key(), stupid as Field as Bytes<32>));

}

export circuit update_record(new_record_hash : Bytes<32>): [] {
    assert state == STATE.filed
        "Attempted to add record to an non-existing record, use add_record instead";
	assert patient_id == public_key(patient_secret_key(), record_hash as Field as Bytes<32>)
    "Attempted to take down post, but not the current patient id";

    record_hash = some<Bytes<32>>(new_record_hash);
}

export circuit delete_record(): [] {
    assert state == STATE.filed
        "Attempted to delete record a non-existing record";
    record_hash = none<Bytes<32>>();
    state = STATE.empty;
}

export circuit public_key(sk: Bytes<32>, data: Bytes<32>): Bytes<32> {
    return persistent_hash<Vector<3, Bytes<32>>>([pad(32, "record:pk:"),
                                                  data,
                                                  sk]);
}

