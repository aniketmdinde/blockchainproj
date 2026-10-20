# CertiChain — Blockchain-Based Certificate Verification

CertiChain is a mini project built using Solidity, Hardhat, Web3.js, and MetaMask to demonstrate how blockchain can be used to issue, verify, and revoke academic certificates.

The project stores certificate hashes on a local Ethereum-compatible blockchain. A verifier can check whether a certificate exists, whether its details match the original record, and whether it has been revoked.

## Features

- **Issue certificates:** Institutions can register certificates on the blockchain.
- **Verify certificates:** Check whether certificate details match the registered record.
- **Detect tampering:** Changes to certificate details produce a hash mismatch.
- **Revoke certificates:** The institution owner can revoke previously issued certificates.
- **Blockchain-backed records:** Certificate hashes and revocation status are stored in a smart contract.
- **Wallet integration:** MetaMask is used to authorize issuing and revoking transactions.

## Tech Stack

- Solidity — Smart contract
- Hardhat — Local blockchain and contract development
- Web3.js — Frontend interaction with the blockchain
- Vite — Frontend development server
- HTML, CSS, and JavaScript — User interface
- MetaMask — Wallet connection and transaction approval

## Project Structure

```text
CertiChain/
├── contracts/
│   └── CertificateRegistry.sol
├── scripts/
│   └── deploy.js
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   └── contract-address.json  # Generated during deployment
├── hardhat.config.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## Prerequisites

Install the following before setting up the project:

- [Node.js and npm](https://nodejs.org/)
- [Git](https://git-scm.com/)
- [MetaMask](https://metamask.io/) browser extension

Check your installation:

```bash
node -v
npm -v
git --version
```

## Initial Setup

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd CertiChain
```

Replace `<YOUR_GITHUB_REPOSITORY_URL>` with your repository's clone URL.

### 2. Install dependencies

```bash
npm ci
```

If `package-lock.json` is not present, use `npm install` instead.

### 3. Start the local blockchain

Open a terminal in the project directory and run:

```bash
npm run node
```

Hardhat starts a local blockchain and displays test accounts, private keys, and the RPC endpoint.

Keep this terminal running.

### 4. Deploy the smart contract

Open a second terminal in the project directory and run:

```bash
npm run deploy
```

The deployment script deploys `CertificateRegistry` to the local blockchain and writes its address to:

```text
frontend/contract-address.json
```

If deployment fails, resolve the error before proceeding.

### 5. Configure MetaMask

Add a custom network in MetaMask using these settings:

| Setting | Value |
|---|---|
| Network name | Hardhat Local |
| RPC URL | `http://127.0.0.1:8545` |
| Chain ID | `31337` |
| Currency symbol | `ETH` |

Import Hardhat's first test account into MetaMask using its private key, then select that account.

The account used to deploy the contract becomes the institution owner. Use the same account to issue and revoke certificates.

**Security:** Hardhat test accounts are for local development only. Never use their private keys on a real network or commit private keys or seed phrases to Git.

### 6. Start the frontend

Open a third terminal in the project directory and run:

```bash
npm run dev
```

Open the local URL printed by Vite, usually:

```text
http://127.0.0.1:5173/
```

The application should now be ready to use.

## Running the Project After Initial Setup

Whenever you want to run CertiChain again, follow this sequence.

**Terminal 1 — Start the blockchain**

```bash
npm run node
```

**Terminal 2 — Deploy the contract**

```bash
npm run deploy
```

**Terminal 3 — Start the frontend**

```bash
npm run dev
```

Keep all three terminals running while using the application.

### Important: Local Blockchain Reset

The Hardhat local blockchain is temporary. Restarting `npm run node` creates a fresh chain and removes previously issued certificates.

After restarting the blockchain, you must deploy the smart contract again. The new deployment generates a new contract address, and certificates must be reissued on the new chain.

## Using CertiChain

### Issue a certificate

1. Open the application and connect MetaMask using the institution owner's account.
2. Enter the certificate ID, student name, course, and issue date in the Institution Portal.
3. Click **Issue Certificate**.
4. Approve the transaction in MetaMask.
5. Wait for the transaction to complete.

### Verify a certificate

1. Enter the certificate ID and the original certificate details in the verification form.
2. Click **Verify Certificate**.
3. Check the result.

Expected outcomes:

- **Verified:** The certificate exists, has not been revoked, and the submitted details match.
- **Mismatch:** The certificate exists, but the submitted details differ.
- **Not Found:** No registered certificate exists for the supplied ID.
- **Revoked:** The certificate has been revoked by the institution.

### Revoke a certificate

1. Connect MetaMask using the institution owner's account.
2. Enter the original certificate ID in the Institution Portal's revocation form.
3. Click **Revoke Certificate**.
4. Approve the transaction in MetaMask.
5. Verify the certificate again to confirm its revoked status.

## How Verification Works

CertiChain calculates a hash from the certificate details and stores it in the smart contract. During verification, the application calculates the hash of the submitted details and compares it with the stored hash.

A mismatch indicates that the submitted details differ from those originally registered. The contract also stores the issuer, issue timestamp, and revocation status.

The current implementation stores hashes and metadata on the local blockchain, not the complete certificate document.

## Limitations

- The project uses a local Hardhat blockchain and is intended for learning and demonstration.
- Certificate records are lost when the local blockchain is restarted.
- The current implementation is not deployed to a public blockchain.
- Production use would require additional security, privacy, access-control, and deployment considerations.

## License

This project is intended for educational purposes. Add a license file if you plan to distribute or reuse the project publicly.
