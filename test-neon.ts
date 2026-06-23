import 'dotenv/config';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
neonConfig.webSocketConstructor = ws;

async function main() {
  const connectionString = process.env.DIRECT_URL;
  console.log("Using string:", connectionString);
  const pool = new Pool({ connectionString });
  
  try {
    const res = await pool.query('SELECT NOW()');
    console.log(res.rows);
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
main();
