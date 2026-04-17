import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import dns from 'node:dns';
import process from 'node:process';
import pg from 'pg';

dns.setDefaultResultOrder('ipv4first');

const { Client } = pg;

async function loadCredentialMap(filePath) {
  const raw = await readFile(filePath, 'utf8');

  return raw
    .split(/\r?\n/)
    .filter((line) => line.includes('=') && !line.trim().startsWith('#'))
    .reduce((result, line) => {
      const index = line.indexOf('=');
      const key = line.slice(0, index).trim();
      const value = line.slice(index + 1).trim();
      result[key] = value;
      return result;
    }, {});
}

function getArg(flagName, fallbackIndex) {
  const direct = process.argv.find((arg) => arg.startsWith(`${flagName}=`));
  if (direct) {
    return direct.slice(flagName.length + 1);
  }

  const flagIndex = process.argv.indexOf(flagName);
  if (flagIndex >= 0) {
    return process.argv[flagIndex + 1] ?? '';
  }

  return process.argv[fallbackIndex] ?? '';
}

function buildConfig(credentials) {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.SUPABASE_DB_URL ||
    '';

  if (connectionString) {
    return {
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
    };
  }

  return {
    host: process.env.SUPABASE_DB_HOST || credentials.SUPABASE_DB_HOST,
    port: Number(process.env.SUPABASE_DB_PORT || credentials.SUPABASE_DB_PORT || 5432),
    database: process.env.SUPABASE_DB_NAME || credentials.SUPABASE_DB_NAME,
    user: process.env.SUPABASE_DB_USER || credentials.SUPABASE_DB_USER,
    password: process.env.SUPABASE_DB_PASSWORD || credentials.SUPABASE_DB_PASSWORD,
    ssl: {
      rejectUnauthorized: false,
    },
  };
}

async function main() {
  const sqlFileArg = getArg('--file', 2);

  if (!sqlFileArg) {
    throw new Error('Missing SQL file path. Usage: node scripts/apply-sql-file.mjs --file supabase/migrations/your-file.sql');
  }

  const credentialsFile = resolve(process.cwd(), process.env.SUPABASE_CREDENTIALS_FILE || 'supabase-credentials.txt');
  const sqlFile = resolve(process.cwd(), sqlFileArg);

  const [credentials, sql] = await Promise.all([
    loadCredentialMap(credentialsFile),
    readFile(sqlFile, 'utf8'),
  ]);

  const client = new Client(buildConfig(credentials));

  try {
    await client.connect();
    await client.query(sql);
    console.log(`Applied SQL file successfully: ${sqlFileArg}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes('No route to host')) {
      console.error('Database host is reachable only over a network path this machine cannot use right now.');
      console.error('Use Supabase SQL Editor, or rerun this script from a network with IPv6/database access.');
    }

    throw error;
  } finally {
    await client.end().catch(() => undefined);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});