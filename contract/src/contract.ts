import CompactStandardLibrary;

export enum STATE { empty, filed}

export ledger state : STATE;
export ledger record_hash: Maybe<Bytes<32>>;
export ledger patient_id  : Bytes<32>;

constructor() {
    record_hash = none<Bytes>();
    state = STATE.empty;
    // doctorPermissions = none<Map<Bytes, String>>(); // Removed as it's not declared as ledger
};

witness patient_secret_key() : Bytes;

export circuit add_patient_and_record(new_record_hash: Bytes, patient_id : Bytes): [] {
    assert state == STATE.empty
        "Attempted to add record to an already existing record, use update_record instead";
    record_hash = some<Bytes>(new_record_hash);
    state = STATE.filed;
    patient_id = disclose(public_key(patient_secret_key(), new_record_hash));
}

export circuit update_record(new_record_hash : Bytes): [] {
    assert state == STATE.filed
        "Attempted to add record to an non-existing record, use add_record instead";
    record_hash = some<Bytes>(new_record_hash);
}

export circuit delete_record(): [] {
    assert state == STATE.filed
        "Attempted to delete record a non-existing record";
    record_hash = none<Bytes>();
    state = STATE.empty;
}

export circuit public_key(sk: Bytes, data: Bytes): Bytes {
    return persistent_hash<Vector<3, Bytes>>([pad(32, "record:pk:"),
                                                  data,
                                                  sk]);
}
