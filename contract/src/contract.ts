pragma language_version >= 0.14.0;

import CompactStandardLibrary;

export ledger record_hash: Maybe<Bytes<32>>;
export ledger doctor_id: Bytes<32>;
export ledger patient_id  : Bytes<32>
export ledger doctorPermissions: Maybe<Map<Bytes, String>>; // e.g., "read", "write"

constructor(patientId: Bytes<32>, doctor_id: Bytes<32>) {
    patientRecordOwner = patientId;
	doctorId = doctor_id;
    recordHash = none<Bytes>();
	doctorPerms = none<Map<Bytes, String>>();
}

export circuit add_record(new_record_hash : Bytes<32>): [] { 
	
}
