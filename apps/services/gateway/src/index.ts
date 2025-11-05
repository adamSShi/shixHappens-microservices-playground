import * as http from 'http';
import * as net from 'net';

interface ServiceConfig {
    host: string;
    port: number;
}

const serviceMap: Record<string, ServiceConfig> = {
    svc1: { host: process.env.SVC1_HOST || '127.0.0.1', port: 4001 },
    svc2: { host: process.env.SVC2_HOST || '127.0.0.1', port: 4002 },
    svc3: { host: process.env.SVC3_HOST || '127.0.0.1', port: 4003 },
    svc4: { host: process.env.SVC4_HOST || '127.0.0.1', port: 4004 },
};

function callService(service: string, cmd: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
        const config = serviceMap[service];
        if (!config) {
            reject(new Error(`Service "${service}" not found`));
            return;
        }

        const client = new net.Socket();
        let responseData = '';
        let timeout: NodeJS.Timeout;
        let resolved = false;

        const cleanup = () => {
            if (timeout) clearTimeout(timeout);
        };

        const handleResponse = () => {
            if (resolved) return;
            resolved = true;
            cleanup();
            console.log(`[Gateway] Received response from ${config.host}:${config.port}:`, responseData);
            if (responseData) {
                try {
                    const parsed = JSON.parse(responseData);
                    resolve(parsed);
                } catch (e) {
                    resolve(responseData);
                }
            } else {
                reject(new Error('No response from service'));
            }
        };

        client.on('data', (data) => {
            const chunk = data.toString();
            console.log(`[Gateway] Received data chunk from ${config.host}:${config.port}:`, chunk);
            responseData += chunk;
        });

        client.on('end', () => {
            console.log(`[Gateway] Socket ended from ${config.host}:${config.port}`);
            handleResponse();
        });

        client.on('close', (hadError) => {
            console.log(`[Gateway] Socket closed from ${config.host}:${config.port}, hadError: ${hadError}, responseData: ${responseData}`);
            if (!resolved) {
                handleResponse();
            }
        });

        client.on('error', (err) => {
            if (resolved) return;
            resolved = true;
            cleanup();
            reject(err);
        });

        client.connect(config.port, config.host, () => {
            const request = JSON.stringify({ cmd, ...data });
            console.log(`[Gateway] Connecting to ${config.host}:${config.port}, sending:`, request);
            client.write(request);
        });

        timeout = setTimeout(() => {
            if (!client.destroyed) {
                client.destroy();
                reject(new Error('Timeout'));
            }
        }, 5000);
    });
}

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const parts = req.url?.split('/').filter(Boolean) || [];
    const [service, cmd] = parts;

    console.log(`[Gateway] ${req.method} ${req.url} - service: ${service}, cmd: ${cmd}`);

    if (!service || !cmd) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid path' }));
        return;
    }

    let body = '';
    req.on('data', (chunk) => {
        body += chunk.toString();
    });

    req.on('error', (err) => {
        console.error(`[Gateway] Request error:`, err);
        if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Request error' }));
        }
    });

    req.on('end', () => {
        let data = {};
        if (body && body.trim()) {
            try {
                data = JSON.parse(body);
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON body' }));
                return;
            }
        }
        callService(service, cmd, data)
            .then((result) => {
                console.log(`[Gateway] Success: ${service}/${cmd} ->`, result);
                if (!res.headersSent) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(result));
                }
            })
            .catch((err) => {
                console.error(`[Gateway] Error calling ${service}/${cmd}:`, err);
                if (!res.headersSent) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: err.message }));
                }
            });
    });
});

const port = process.env.PORT || 3000;
server.listen(Number(port), '0.0.0.0', () => {
    console.log(`✅ Gateway is running on HTTP port ${port}`);
});

