import { NextResponse } from 'next/server';

const spec = {
  openapi: '3.1.0',
  info: {
    title: 'CoinsFlow Blockchain API',
    version: '1.0.0',
    description:
      'REST API for querying Litecoin blockchain data including addresses, transactions, blocks, and live price. Free tier — unlimited requests during beta.',
    contact: {
      name: 'CoinsFlow',
      url: 'https://coinsflow.net',
    },
    license: {
      name: 'Proprietary',
      url: 'https://coinsflow.net/about',
    },
  },
  servers: [{ url: 'https://api.coinsflow.net', description: 'Production' }],
  security: [{ apiKey: [] }],
  components: {
    securitySchemes: {
      apiKey: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'API key starting with `cf_live_`. Get a free key at https://coinsflow.net/apis/dashboard',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Invalid or missing API key' },
        },
      },
      AddressResponse: {
        type: 'object',
        properties: {
          address:        { type: 'string', example: 'LMURqs4tNveEY75pzFQpPiBR67fgqUPmgT' },
          balance:        { type: 'number', example: 4.72819341 },
          total_received: { type: 'number', example: 48.0 },
          total_sent:     { type: 'number', example: 43.27180659 },
          tx_count:       { type: 'integer', example: 217 },
          chain:          { type: 'string', example: 'litecoin' },
          transactions:   { type: 'array', items: { type: 'object' } },
        },
      },
      TransactionResponse: {
        type: 'object',
        properties: {
          txid:           { type: 'string' },
          confirmations:  { type: 'integer', example: 4812 },
          block_height:   { type: 'integer' },
          fee:            { type: 'number', example: 0.0001 },
          inputs:         { type: 'array', items: { type: 'object' } },
          outputs:        { type: 'array', items: { type: 'object' } },
          timestamp:      { type: 'integer', example: 1714003201 },
        },
      },
      BlockResponse: {
        type: 'object',
        properties: {
          hash:      { type: 'string' },
          height:    { type: 'integer', example: 2700000 },
          timestamp: { type: 'integer', example: 1714003201 },
          tx_count:  { type: 'integer', example: 42 },
          size:      { type: 'integer', example: 18540 },
          txids:     { type: 'array', items: { type: 'string' } },
        },
      },
      PriceResponse: {
        type: 'object',
        properties: {
          price_usd: { type: 'number', example: 56.02 },
        },
      },
    },
  },
  paths: {
    '/v1/address/ltc/{address}': {
      get: {
        summary: 'Get Litecoin address info',
        description: 'Returns balance, transaction count, total received, total sent, and recent transactions for a Litecoin address.',
        operationId: 'getLitecoinAddress',
        tags: ['Address'],
        parameters: [
          { name: 'address', in: 'path', required: true, schema: { type: 'string' }, description: 'A valid Litecoin address (L/M/ltc1 format)', example: 'LMURqs4tNveEY75pzFQpPiBR67fgqUPmgT' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number for transaction history' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 25, maximum: 50 }, description: 'Transactions per page (max 50)' },
        ],
        responses: {
          200: { description: 'Address data', content: { 'application/json': { schema: { $ref: '#/components/schemas/AddressResponse' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Address not found on chain', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          429: { description: 'Rate limit exceeded', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/v1/tx/ltc/{txid}': {
      get: {
        summary: 'Get Litecoin transaction',
        description: 'Returns full transaction detail including inputs, outputs, fees, block height, and confirmation count.',
        operationId: 'getLitecoinTransaction',
        tags: ['Transaction'],
        parameters: [
          { name: 'txid', in: 'path', required: true, schema: { type: 'string', minLength: 64, maxLength: 64 }, description: '64-character hex transaction ID', example: '07de5fb0c9ac8a3380e2fa62cae70e89680c0b87aa4b92acfb1497ddbb6e02f4' },
        ],
        responses: {
          200: { description: 'Transaction data', content: { 'application/json': { schema: { $ref: '#/components/schemas/TransactionResponse' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Transaction not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          429: { description: 'Rate limit exceeded', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/v1/block/ltc/{hash}': {
      get: {
        summary: 'Get Litecoin block by hash',
        description: 'Returns block header info and transaction IDs for the given block hash.',
        operationId: 'getLitecoinBlock',
        tags: ['Block'],
        parameters: [
          { name: 'hash', in: 'path', required: true, schema: { type: 'string', minLength: 64, maxLength: 64 }, description: '64-character hex block hash', example: 'f2cb635024c61f14257716e8ae12a376e5d811c22d81066e3003c84ea4d66af2' },
        ],
        responses: {
          200: { description: 'Block data', content: { 'application/json': { schema: { $ref: '#/components/schemas/BlockResponse' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Block not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          429: { description: 'Rate limit exceeded', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/v1/blocks/ltc': {
      get: {
        summary: 'Get latest Litecoin blocks',
        description: 'Returns the 10 most recent Litecoin blocks with height, hash, timestamp, tx count, and size.',
        operationId: 'getLatestLitecoinBlocks',
        tags: ['Block'],
        responses: {
          200: {
            description: 'Latest blocks',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/BlockResponse' },
                },
              },
            },
          },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          429: { description: 'Rate limit exceeded', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/v1/price/ltc': {
      get: {
        summary: 'Get current LTC/USD price',
        description: 'Returns the current Litecoin price in USD sourced from CoinGecko.',
        operationId: 'getLitecoinPrice',
        tags: ['Price'],
        responses: {
          200: { description: 'Current LTC price', content: { 'application/json': { schema: { $ref: '#/components/schemas/PriceResponse' } } } },
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          429: { description: 'Rate limit exceeded', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
  },
};

export function GET() {
  return NextResponse.json(spec, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
