#!/usr/bin/env node

/**
 * DAX E-Commerce Platform - System Verification Script
 * Verifies all services are running and accessible
 */

const http = require('http');

const endpoints = [
  { name: 'Backend API', url: 'http://localhost:5000/health', port: 5000 },
  { name: 'Frontend Store', url: 'http://localhost:3000', port: 3000 },
  { name: 'Admin Dashboard', url: 'http://localhost:3002', port: 3002 },
];

console.log('\n🔍 DAX System Verification\n' + '='.repeat(40));

let passed = 0;
let failed = 0;

endpoints.forEach((endpoint) => {
  const startTime = Date.now();
  
  http.get(endpoint.url, { timeout: 5000 }, (res) => {
    const responseTime = Date.now() - startTime;
    console.log(`✅ ${endpoint.name.padEnd(20)} | Status: ${res.statusCode} | ${responseTime}ms`);
    passed++;
    
    if (passed + failed === endpoints.length) {
      printSummary();
    }
  }).on('error', (err) => {
    console.log(`❌ ${endpoint.name.padEnd(20)} | Error: ${err.code}`);
    failed++;
    
    if (passed + failed === endpoints.length) {
      printSummary();
    }
  });
});

function printSummary() {
  console.log('\n' + '='.repeat(40));
  console.log(`\n📊 Summary: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('\n🎉 All systems operational!\n');
    process.exit(0);
  } else {
    console.log(`\n⚠️  ${failed} service(s) not responding\n`);
    process.exit(1);
  }
}
