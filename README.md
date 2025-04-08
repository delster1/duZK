# DUZK
Healthcare-focused security with Midnight and Pinata

### About
Patients' medical data have suffered from security flaws for years, and DUZK aims to make it as painless as possible to switch to a more secure solution.

### How is this secure?
DUZK leverages Midnight's zero-knowledge proof framework to ensure that patients don't reveal any of their data when accessing their medical records. Pinata allows for data-agnostic file storage of patient health records by hospitals with a hospital's given secret key. The data-agnostic nature of Pinata means that it is much easier for hospitals to adopt DUZK, even if still using old/legacy filesystems. Moreover, the distributed nature of the blockchain means that even if one node goes down, the entire network will keep working and maintaining secure data.

### Building & Running DUZK!
First, install dependencies with yarn install in the base directory. Next, pull the proof server with Docker: docker pull midnightnetwork/proof-server

Then, build with the following command in the base directory:

`npx turbo build`
To run the app,

`yarn testnet-remote`
in one session, while running a Docker session with

`docker run -p 6300:6300 midnightnetwork/proof-server -- 'midnight-proof-server --network testnet'`
Make sure to have .env files set in each directory with PINATA_JWT and GATEWAY_URL set with your associated Pinata account's JWT and gateway!
