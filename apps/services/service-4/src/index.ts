import * as net from 'net';
import { Pool } from 'pg';

const pool = new Pool({
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT) || 5432,
    user: process.env.DATABASE_USER || 'admin',
    password: process.env.DATABASE_PASSWORD || 'admin123',
    database: process.env.DATABASE_NAME || 'db_svc4',
});

const server = net.createServer((socket) => {
    socket.on('data', async (data) => {
        try {
            const msg = JSON.parse(data.toString());
            console.log(`[Service-4] Received:`, msg);
            if (msg.cmd === 'whoami') {
                try {
                    const result = await pool.query('SELECT * FROM records LIMIT 1');
                    const record = result.rows[0];
                    const response = record
                        ? JSON.stringify(`這是第4個服務 - 資料庫資料: ${record.name} (ID: ${record.id})`)
                        : JSON.stringify('這是第4個服務 - 資料庫中沒有資料');
                    socket.write(response);
                    socket.end();
                } catch (dbError) {
                    console.error(`[Service-4] Database error:`, dbError);
                    const error = JSON.stringify({ error: `Database error: ${(dbError as Error).message}` });
                    socket.write(error);
                    socket.end();
                }
            }
        } catch (e) {
            const error = JSON.stringify({ error: (e as Error).message });
            socket.write(error);
            socket.end();
        }
    });

    socket.on('error', (err) => {
        console.error(`[Service-4] Socket error:`, err);
    });
});

server.listen(4004, '0.0.0.0', () => {
    console.log('✅ Service-4 is running on TCP port 4004');
    console.log(`   Database: ${process.env.DATABASE_NAME || 'db_svc4'}`);
});

