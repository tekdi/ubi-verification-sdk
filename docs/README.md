# Sunbird RC Credential Verifier (Node.js Library)

A lightweight Node.js library to verify credentials issued via [Sunbird RC](https://sunbirdrc.dev/) or compatible platforms (e.g., [Dhiway SaaS](https://cord.network/)) using their public Verify APIs.

## Features

- Verifies Verifiable Credentials (VCs) via the `/verify/credentials/verify` API endpoint
- Supports any hosted Sunbird RC-compatible instance
- Lightweight and dependency-free verification logic
- Works seamlessly with platforms like Dhiway, Sunbird RC hosted on cloud or on-prem

## Installation

```bash
npm install @yourorg/sunbird-rc-verifier

## Usage

### Example

```javascript
const { verifyCredential } = require('@yourorg/sunbird-rc-verifier');

const credential = require('./sample-credential.json');

const VERIFY_ENDPOINT = 'https://api.cord.network/api/v1/verify/credentials/verify'; // Replace with your Sunbird RC-compatible instance

async function run() {
  try {
    const result = await verifyCredential(credential, VERIFY_ENDPOINT);
    console.log('✅ Credential Verified:', result);
  } catch (err) {
    console.error('❌ Verification Failed:', err.message);
  }
}

run();

## API Reference

### `verifyCredential(credentialJson, verifyEndpointUrl)`

Verifies a credential against a Sunbird RC-compatible verification API.

#### Parameters

- **`credentialJson`** (`object`):  
  The Verifiable Credential (VC) JSON object.

- **`verifyEndpointUrl`** (`string`):  
  The full URL of the `/verify/credentials/verify` API endpoint (e.g., Dhiway's API).

#### Returns

- A `Promise` that resolves with the verification result if successful, or throws an error if verification fails.
