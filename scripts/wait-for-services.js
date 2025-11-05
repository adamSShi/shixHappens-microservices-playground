const http = require('http');
const net = require('net');

const services = [
  { name: 'svc1', port: 4001, type: 'tcp' },
  { name: 'svc2', port: 4002, type: 'tcp' },
  { name: 'svc3', port: 4003, type: 'tcp' },
  { name: 'svc4', port: 4004, type: 'tcp' },
  { name: 'gateway', port: 3000, type: 'http' },
];

function checkTcp(host, port, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    let resolved = false;

    const cleanup = () => {
      if (!client.destroyed) {
        client.destroy();
      }
    };

    client.setTimeout(timeout);
    client.on('timeout', () => {
      if (!resolved) {
        resolved = true;
        cleanup();
        reject(new Error('Timeout'));
      }
    });

    client.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        cleanup();
        reject(err);
      }
    });

    client.on('connect', () => {
      if (!resolved) {
        resolved = true;
        cleanup();
        resolve(true);
      }
    });

    client.connect(port, host);
  });
}

function checkHttp(host, port, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://${host}:${port}`, { timeout }, (res) => {
      resolve(true);
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function waitForService(service, maxRetries = 30, delay = 1000) {
  // 在 Docker 容器內，使用服務名稱；在本地使用 localhost
  const isDocker = process.env.VITE_API_TARGET || false;
  const host = isDocker ? service.name : 'localhost';
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      if (service.type === 'tcp') {
        await checkTcp(host, service.port, 3000);
      } else {
        await checkHttp(host, service.port, 3000);
      }
      console.log(`✅ ${service.name} is ready`);
      return true;
    } catch (err) {
      if (i < maxRetries - 1) {
        process.stdout.write(`⏳ Waiting for ${service.name}... (${i + 1}/${maxRetries})\r`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error(`\n❌ ${service.name} failed to start after ${maxRetries} attempts`);
        return false;
      }
    }
  }
  return false;
}

async function main() {
  console.log('🚀 Waiting for services to be ready...\n');
  
  const results = await Promise.all(services.map(service => waitForService(service)));
  
  const allReady = results.every(r => r === true);
  
  if (allReady) {
    console.log('\n✅ All services are ready!\n');
    process.exit(0);
  } else {
    console.log('\n❌ Some services failed to start');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

