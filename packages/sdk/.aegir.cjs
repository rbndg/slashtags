'use strict';
const path = require('path');
const createTestnet = require('@hyperswarm/testnet');
const { setupRelay } = require('dht-universal/setup-relay.js');

const esbuild = {
  inject: [path.join(__dirname, '../../scripts/node-globals.js')],
};

module.exports = {
  test: {
    browser: {
      config: {
        buildConfig: esbuild,
      },
    },
    async before(options) {
      let closeTestnet;

      const nodes = await createTestnet(10, (cb) => (closeTestnet = cb));
      const bootstrap = [{ host: '127.0.0.1', port: nodes[0].address().port }];

      const { port, closeRelay } = await setupRelay();

      return {
        closeTestnet,
        closeRelay,
        env: {
          BOOTSTRAP: JSON.stringify(bootstrap),
          RELAY_URL: 'ws://localhost:' + port,
        },
      };
    },
    async after(options, before) {
      await before.closeTestnet();
      await before.closeRelay();
    },
  },
  build: {
    config: esbuild,
  },
};
