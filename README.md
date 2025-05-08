# UBI Verification SDK (Node.js Library)

A lightweight Node.js library to verify credentials using configurable verification methods.

## Features

- Verifies credentials using a remote verification API (`verify_using_api`)
- Configurable and extensible for various use cases
- Built with Fastify for high performance and scalability

## Usage

### Example

```javascript
const axios = require('axios');

const VERIFY_ENDPOINT = 'https://your-verification-api.com/verify'; // Replace with your verification API endpoint

const credential = {
  // Your credential JSON here
};

const config = {
  method: 'verify_using_api', // Default is 'verify_using_api'
};

async function verifyCredential() {
  try {
    const response = await axios.post('http://localhost:3000/verification', {
      credential,
      config,
    });
    console.log('✅ Verification Result:', response.data);
  } catch (error) {
    console.error('❌ Verification Failed:', error.response?.data || error.message);
  }
}

verifyCredential();
```

## API Reference

### `/verification` Endpoint

#### Description

Verifies a credential.

#### Request Body

- **`credential`** (`object`, required):  
  The credential JSON to be verified.

- **`config`** (`object`, optional):  
  Configuration object for verification.  
  - **`method`** (`string`, optional):  
    The verification method to use.  
    - `"verify_using_api"` (default): Verifies using a remote API.

#### Response

- **`success`** (`boolean`):  
  Indicates if the verification was successful.

- **`message`** (`string`):  
  A message describing the result of the verification.

- **`result`** (`object`, optional):  
  Contains details of the verification checks performed.

- **`errors`** (`array`, optional):  
  List of errors encountered during verification.

#### Example Request

```json
{
  "credential": {
    "id": "12345",
    "type": "VerifiableCredential",
    "issuer": "https://example.com",
    "credentialSubject": {
      "id": "did:example:123",
      "name": "John Doe"
    }
  },
  "config": {
    "method": "verify_using_api"
  }
}
```

#### Example Response

```json
{
  "success": true,
  "message": "Credential verified successfully.",
  "result": {
    "checks": [
      {
        "title": "Signature Check",
        "status": true
      }
    ]
  },
  "errors": []
}
```

## Running the Server

To start the server, run:

```bash
node src/index.js
```

The server will be available at `http://localhost:3000`.

## Health Check

You can check the health of the API by accessing the `/health` endpoint:

```bash
curl http://localhost:3000/health
```

Response:

```json
{
  "status": "ok"
}
```
