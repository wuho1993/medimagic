import { NextResponse } from 'next/server';

const DEFAULT_BASE_URL = 'https://ai.aiclick.cc/v1';
const DEFAULT_MODELS = ['gpt-5.6-terra', 'gpt-5.6-sol', 'gpt-5.5'];

function normalizeOpenAiBaseUrl(value: string) {
  const baseUrl = value.replace(/\/$/, '');
  return baseUrl.endsWith('/v1') ? baseUrl : `${baseUrl}/v1`;
}

function getModelCandidates() {
  const configuredModels = (process.env.AI_MODEL || '')
    .split(',')
    .map((model) => model.trim())
    .filter(Boolean);

  return Array.from(new Set([...configuredModels, ...DEFAULT_MODELS]));
}

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json() as { prompt?: string };
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Missing prompt.' }, { status: 400 });
    }

    const apiKey = process.env.AI_API_KEY;
    const baseUrl = normalizeOpenAiBaseUrl(process.env.AI_BASE_URL || DEFAULT_BASE_URL);
    const models = getModelCandidates();

    if (!apiKey) {
      return NextResponse.json({ error: 'Missing AI_API_KEY.' }, { status: 500 });
    }

    const errors: string[] = [];

    for (const model of models) {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are a payroll import assistant. Return only valid JSON array output and nothing else.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.1,
          max_tokens: 800,
        }),
      });

      const responseText = await response.text();

      if (!response.ok) {
        errors.push(`${model}: ${response.status} ${responseText.slice(0, 300)}`);
        if ([400, 401, 403].includes(response.status)) {
          break;
        }
        continue;
      }

      let payload: { choices?: Array<{ message?: { content?: string | null } }> };
      try {
        payload = JSON.parse(responseText) as { choices?: Array<{ message?: { content?: string | null } }> };
      } catch {
        errors.push(`${model}: response was not JSON (${responseText.slice(0, 80)})`);
        continue;
      }

      const text = payload.choices?.[0]?.message?.content ?? '';
      if (text) {
        return NextResponse.json({ text, model });
      }

      errors.push(`${model}: empty AI response`);
    }

    return NextResponse.json({ error: `No available AI model channel. Tried: ${errors.join(' | ')}` }, { status: 503 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
