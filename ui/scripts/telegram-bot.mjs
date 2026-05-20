import { execFile } from 'node:child_process';
import https from 'node:https';
import { appendFileSync, readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(process.cwd());
const SAFE_COMMANDS = new Map([
  ['/typecheck', { cmd: 'npm', args: ['run', 'typecheck'], timeoutMs: 120_000 }],
  ['/build', { cmd: 'npm', args: ['run', 'build'], timeoutMs: 180_000 }],
]);
const CODE_TIMEOUT_MS = 900_000;
const SYNC_CONTEXT_FILE = resolve(ROOT, 'TELEGRAM_SYNC_CONTEXT.md');
const PROJECT_CONTEXT_FILE = resolve(ROOT, 'PROJECT_CONTEXT.md');
let activeCodeTask = null;

function nowStamp() {
  return new Date().toLocaleString('en-HK', { hour12: false });
}

function appendSyncLog(entry) {
  const safeEntry = String(entry).replace(/\n{3,}/g, '\n\n').trim();
  appendFileSync(SYNC_CONTEXT_FILE, `\n## ${nowStamp()}\n\n${safeEntry}\n`, 'utf8');
}

function readRecentSyncContext(maxChars = 8000) {
  if (!existsSync(SYNC_CONTEXT_FILE)) return '(no Telegram sync history yet)';
  const text = readFileSync(SYNC_CONTEXT_FILE, 'utf8');
  return text.slice(-maxChars);
}

function readProjectContext(maxChars = 12000) {
  if (!existsSync(PROJECT_CONTEXT_FILE)) return '(PROJECT_CONTEXT.md missing)';
  const text = readFileSync(PROJECT_CONTEXT_FILE, 'utf8');
  return text.slice(-maxChars);
}

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  const text = readFileSync(path, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=').trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key.trim()]) process.env[key.trim()] = value;
  }
}

loadEnvFile(resolve(ROOT, '.env.local'));

const token = process.env.TELEGRAM_BOT_TOKEN;
const allowedIds = new Set(
  (process.env.TELEGRAM_ALLOWED_USER_IDS ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean),
);

if (!token) {
  console.error('Missing TELEGRAM_BOT_TOKEN in .env.local');
  process.exit(1);
}

let offset = 0;

async function telegram(method, body) {
  const payload = JSON.stringify(body);
  return new Promise((resolveTelegram, rejectTelegram) => {
    const request = https.request({
      hostname: 'api.telegram.org',
      path: `/bot${token}/${method}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
      timeout: 70_000,
    }, (response) => {
      let raw = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { raw += chunk; });
      response.on('end', () => {
        try {
          const data = JSON.parse(raw || '{}');
          if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300 && data?.ok) {
            resolveTelegram(data.result);
            return;
          }
          rejectTelegram(new Error(data?.description ?? `Telegram ${method} failed`));
        } catch (error) {
          rejectTelegram(error);
        }
      });
    });
    request.on('error', rejectTelegram);
    request.on('timeout', () => request.destroy(new Error(`Telegram ${method} timeout`)));
    request.write(payload);
    request.end();
  });
}

async function sendMessage(chatId, text) {
  const chunks = text.match(/[\s\S]{1,3900}/g) ?? [''];
  for (const chunk of chunks) {
    await telegram('sendMessage', {
      chat_id: chatId,
      text: chunk,
      disable_web_page_preview: true,
    });
  }
}

function runSafeCommand(command) {
  return new Promise((resolveCommand) => {
    execFile(command.cmd, command.args, {
      cwd: ROOT,
      timeout: command.timeoutMs,
      maxBuffer: 1024 * 1024,
    }, (error, stdout, stderr) => {
      const output = [stdout, stderr].filter(Boolean).join('\n').trim();
      const status = error ? `FAILED (${error.code ?? error.signal ?? 'error'})` : 'OK';
      resolveCommand(`${status}\n\n${output || '(no output)'}`);
    });
  });
}

function runOpencodeTask(prompt) {
  return new Promise((resolveCommand) => {
    const syncedPrompt = [
      'Before coding, read and follow PROJECT_CONTEXT.md. Treat it as mandatory shared project context:',
      readProjectContext(),
      '',
      'Recent Telegram sync history:',
      readRecentSyncContext(),
      '',
      'User Telegram task:',
      prompt,
      '',
      'Work in this existing codebase. Inspect files first, make minimal correct changes, run verification when appropriate, and answer Joe in Cantonese / Traditional Chinese.',
    ].join('\n');
    const child = execFile('opencode', ['run', syncedPrompt], {
      cwd: ROOT,
      timeout: CODE_TIMEOUT_MS,
      maxBuffer: 1024 * 1024 * 4,
    }, (error, stdout, stderr) => {
      const output = [stdout, stderr].filter(Boolean).join('\n').trim();
      const status = error ? `FAILED (${error.code ?? error.signal ?? 'error'})` : 'OK';
      const result = `${status}\n\n${output || '(no output)'}`;
      appendSyncLog(`OpenCode result for prompt:\n\n${prompt}\n\nResult:\n\n${result.slice(-6000)}`);
      resolveCommand(result);
    });
    if (activeCodeTask) activeCodeTask.child = child;
  });
}

function isAllowed(userId, command) {
  if (command === '/id' || command === '/start') return true;
  return allowedIds.has(String(userId));
}

function helpText(userId) {
  const locked = allowedIds.size === 0
    ? '\n\nSecurity setup needed: send /id, then add TELEGRAM_ALLOWED_USER_IDS to .env.local.'
    : '';
  return [
    'Medi Magic HRMS bot ready.',
    '',
    `Your Telegram ID: ${userId}`,
    '',
    'Commands:',
    '/id - show your Telegram user ID',
    '/status - project status and URLs',
    '/typecheck - run TypeScript check',
    '/build - run production build',
    '/code <task> - ask OpenCode to work in this project',
    '/cancel - stop the current OpenCode task',
    '/history - show recent synced Telegram/OpenCode context',
    '/urls - local app URLs',
    '/help - show this help',
    locked,
  ].join('\n');
}

function statusText() {
  return [
    'Medi Magic HRMS status',
    `OpenCode task: ${activeCodeTask ? `running since ${activeCodeTask.startedAt}` : 'idle'}`,
    '',
    'Recent completed work:',
    '- Payroll AL/SH rolling 365 average commission connected',
    '- Legal average wage top-up check connected',
    '- Average wages query page added',
    '- SF363/SF373 excluded as resigned/inactive',
    '',
    'Local URLs:',
    'http://localhost:3000/medimagic/app/payroll/',
    'http://localhost:3000/medimagic/app/payroll/average-wages',
  ].join('\n');
}

function startCodeTask(chatId, prompt) {
  if (activeCodeTask) {
    return sendMessage(chatId, `OpenCode is already running a task started at ${activeCodeTask.startedAt}. Wait for it to finish first.`);
  }
  activeCodeTask = { startedAt: new Date().toLocaleString('en-HK') };
  sendMessage(chatId, 'OpenCode task started in background. You can still use /status while it runs.').catch(console.error);
  runOpencodeTask(prompt)
    .then((result) => sendMessage(chatId, result))
    .catch((error) => sendMessage(chatId, `FAILED\n\n${error instanceof Error ? error.message : String(error)}`))
    .finally(() => { activeCodeTask = null; });
}

async function handleMessage(message) {
  const chatId = message.chat?.id;
  const userId = message.from?.id;
  const text = String(message.text ?? '').trim();
  if (!chatId || !userId || !text) return;

  const command = text.split(/\s+/)[0].toLowerCase();
  appendSyncLog(`Telegram message from ${userId}:\n\n${text}`);
  if (!isAllowed(userId, command)) {
    await sendMessage(chatId, `Unauthorized. Your Telegram ID is ${userId}. Add it to TELEGRAM_ALLOWED_USER_IDS on the server.`);
    return;
  }

  if (command === '/start' || command === '/help' || command === '/id') {
    await sendMessage(chatId, helpText(userId));
    return;
  }
  if (command === '/status') {
    await sendMessage(chatId, statusText());
    return;
  }
  if (command === '/history') {
    await sendMessage(chatId, readRecentSyncContext(3500));
    return;
  }
  if (command === '/cancel') {
    if (!activeCodeTask?.child) {
      await sendMessage(chatId, 'No active OpenCode task.');
      return;
    }
    activeCodeTask.child.kill('SIGTERM');
    await sendMessage(chatId, 'Cancel signal sent to current OpenCode task.');
    return;
  }
  if (command === '/urls') {
    await sendMessage(chatId, 'Payroll: http://localhost:3000/medimagic/app/payroll/\nAverage wages: http://localhost:3000/medimagic/app/payroll/average-wages');
    return;
  }
  if (SAFE_COMMANDS.has(command)) {
    await sendMessage(chatId, `Running ${command}...`);
    await sendMessage(chatId, await runSafeCommand(SAFE_COMMANDS.get(command)));
    return;
  }
  if (command === '/code') {
    const prompt = text.replace(/^\/code\s*/i, '').trim();
    if (!prompt) {
      await sendMessage(chatId, 'Usage: /code <task for OpenCode>');
      return;
    }
    await startCodeTask(chatId, prompt);
    return;
  }

  await sendMessage(chatId, 'Unknown command. Send /help.');
}

async function poll() {
  while (true) {
    try {
      const updates = await telegram('getUpdates', { offset, timeout: 50, allowed_updates: ['message'] });
      for (const update of updates) {
        offset = update.update_id + 1;
        await handleMessage(update.message ?? {});
      }
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      await new Promise((resolveRetry) => setTimeout(resolveRetry, 3000));
    }
  }
}

console.log('Medi Magic Telegram bot polling started.');
poll();
