#!/usr/bin/env node

const { ATM } = require('../src/atm');

async function main() {
  try {
    const atm = new ATM();
    await atm.start();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();