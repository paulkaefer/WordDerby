import { readFileSync } from 'node:fs';
import { beforeEach, describe, test } from '@e2e-dev/web';
import { expect } from 'e2e';

// Seeds a known one-word round (CAT, 7 falls) once per browser context, so reloads keep progress.
const SEED = () => {
  if (localStorage.getItem('e2e.seeded')) return;
  localStorage.setItem('e2e.seeded', '1');
  const now = Date.now();
  const letters = 'CAT'.split('').map((char) => ({ char, guessable: true, revealed: false }));
  localStorage.setItem(
    'wordderby.round',
    JSON.stringify({
      id: 'round-e2e',
      words: [{ text: 'CAT', letters }],
      guessedLetters: [],
      clock: { elapsedSteps: 0, closingAtSteps: 7 },
      fallCount: 0,
      status: 'in_progress',
      startedAt: now,
      updatedAt: now,
    }),
  );
};

const WRONG_FOR_CAT = ['X', 'Y', 'Z', 'Q', 'J', 'V', 'W'];

describe('seeded round (CAT)', { tags: ['game'] }, () => {
  beforeEach(async ({ app, browser }) => {
    await browser.addInitScript(SEED);
    await app.open('/');
  });

  test('starts with three hidden letters and a full clock', async ({ screen, browser }) => {
    await expect(screen.getByRole('heading', 'WordDerby')).toBeVisible();
    await expect(browser.locator('[aria-label="hidden letter"]')).toHaveCount(3);
    await expect(screen.getByText('7 falls left before closing')).toBeVisible();
  });

  test('a correct guess reveals the letter and does not move the clock', async ({ screen, browser }) => {
    await screen.getByRole('button', 'C').tap();
    await expect(browser.locator('[aria-label="revealed letter C"]')).toHaveCount(1);
    await expect(browser.locator('[aria-label="hidden letter"]')).toHaveCount(2);
    await expect(screen.getByText('7 falls left before closing')).toBeVisible();
    await expect(browser.locator('button[data-result="correct"]')).toHaveCount(1);
  });

  test('a wrong guess advances the clock and marks the key as wrong', async ({ screen, browser }) => {
    await screen.getByRole('button', 'X').tap();
    await expect(screen.getByText('6 falls left before closing')).toBeVisible();
    await expect(browser.locator('button[data-result="wrong"]')).toHaveCount(1);
    await expect(browser.locator('[aria-label="hidden letter"]')).toHaveCount(3);
  });

  test('a repeated letter gets gentle feedback and no penalty', async ({ screen, browser }) => {
    await screen.getByRole('button', 'X').tap();
    await browser.keyboard.press('x');
    await expect(screen.getByText('6 falls left before closing')).toBeVisible();
    await expect(browser.locator('button[data-result="wrong"]')).toHaveCount(1);
  });

  test('the physical keyboard guesses letters, and Ctrl combos do not', async ({ screen, browser }) => {
    await browser.keyboard.press('Control+a');
    await expect(browser.locator('button[data-result]')).toHaveCount(0);
    await browser.keyboard.press('a');
    await expect(browser.locator('button[data-result="correct"]')).toHaveCount(1);
    await expect(screen.getByText('7 falls left before closing')).toBeVisible();
  });

  test('winning keeps the solved word visible', async ({ screen, browser }) => {
    for (const letter of ['C', 'A', 'T']) await screen.getByRole('button', letter).tap();
    await expect(screen.getByText('You solved it!', { exact: false })).toBeVisible();
    await expect(browser.locator('[aria-label="revealed letter C"]')).toHaveCount(1);
    await expect(browser.locator('[aria-label="revealed letter A"]')).toHaveCount(1);
    await expect(browser.locator('[aria-label="revealed letter T"]')).toHaveCount(1);
    await expect(screen.getByRole('button', 'Play again')).toBeVisible();
  });

  test('losing shows the answer and marks the letters that were missed', async ({ screen, browser }) => {
    for (const letter of WRONG_FOR_CAT) await screen.getByRole('button', letter).tap();
    await expect(screen.getByText("the rink's closing", { exact: false })).toBeVisible();
    for (const letter of ['C', 'A', 'T']) {
      await expect(browser.locator(`[aria-label="missed letter ${letter}"]`)).toHaveCount(1);
    }
  });

  test('progress survives a reload', async ({ app, screen, browser }) => {
    await screen.getByRole('button', 'C').tap();
    await screen.getByRole('button', 'X').tap();
    await app.open('/');
    await expect(browser.locator('[aria-label="revealed letter C"]')).toHaveCount(1);
    await expect(screen.getByText('6 falls left before closing')).toBeVisible();
  });

  test('"Solve it for me" ends the round as assisted with the words shown', async ({ screen, browser }) => {
    await screen.getByRole('button', 'Solve it for me (no score)').tap();
    await expect(screen.getByText('Solved with a little help!')).toBeVisible();
    await expect(browser.locator('[aria-label="revealed letter C"]')).toHaveCount(1);
  });

  test('Play again starts a fresh round', async ({ screen, browser }) => {
    await screen.getByRole('button', 'Solve it for me (no score)').tap();
    await screen.getByRole('button', 'Play again').tap();
    await expect(screen.getByText('7 falls left before closing')).toBeVisible();
    await expect(browser.locator('button[data-result]')).toHaveCount(0);
  });
});

describe('categories', { tags: ['categories'] }, () => {
  const spaceWords = (JSON.parse(readFileSync('src/data/words.json', 'utf8')) as { text: string; category: string }[])
    .filter((w) => w.category === 'space')
    .map((w) => w.text.replace(/\s+/g, ''));

  beforeEach(async ({ app, browser }) => {
    await browser.addInitScript(SEED);
    await app.open('/');
  });

  test('"start now" with a picked category uses only that category', async ({ screen, browser }) => {
    await screen.getByText('Word categories').tap();
    await screen.getByRole('radio', 'Pick categories').check();
    await screen.getByRole('checkbox', 'Space').check();
    await screen.getByRole('button', 'Start a new round now with these categories').tap();

    await expect(browser.locator('button[data-result]')).toHaveCount(0);
    await screen.getByRole('button', 'Solve it for me (no score)').tap();

    const shown = await browser.locator('.word-blanks__word').allTextContents();
    expect(shown.length).toBe(3);
    for (const text of shown) expect(spaceWords).toContain(text.replace(/\s+/g, ''));
  });

  test('the category choice persists across reloads', async ({ app, screen }) => {
    await screen.getByText('Word categories').tap();
    await screen.getByRole('radio', 'Random category each round').check();
    await app.open('/');
    await screen.getByText('Word categories').tap();
    await expect(screen.getByRole('radio', 'Random category each round')).toBeChecked();
  });
});

describe('event log', { tags: ['logging'] }, () => {
  beforeEach(async ({ app, browser }) => {
    await browser.addInitScript(SEED);
    await app.open('/');
  });

  test('records guesses with strikes remaining and ISO 8601 timestamps', async ({ screen, browser }) => {
    await screen.getByRole('button', 'X').tap();
    await screen.getByRole('button', 'C').tap();

    const raw = await browser.evaluate(() => localStorage.getItem('wordderby.eventlog') ?? '');
    const events = raw.split('\n').filter(Boolean).map((l) => JSON.parse(l) as {
      seq: number;
      timestamp: string;
      type: string;
      data: Record<string, unknown>;
    });

    expect(events.map((e) => e.seq)).toEqual(events.map((_, i) => i));
    for (const e of events) expect(e.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

    expect(events.some((e) => e.type === 'session_start')).toBe(true);
    const guesses = events.filter((e) => e.type === 'guess');
    expect(guesses.map((g) => [g.data.letter, g.data.outcome, g.data.strikesRemaining])).toEqual([
      ['X', 'wrong', 6],
      ['C', 'correct', 6],
    ]);
  });

  test('records word completion and round end', async ({ screen, browser }) => {
    for (const letter of ['C', 'A', 'T']) await screen.getByRole('button', letter).tap();
    const raw = await browser.evaluate(() => localStorage.getItem('wordderby.eventlog') ?? '');
    const types = raw.split('\n').filter(Boolean).map((l) => (JSON.parse(l) as { type: string }).type);
    expect(types).toContain('word_completed');
    expect(types).toContain('round_end');
  });

  test('records window behavior', async ({ browser }) => {
    await browser.evaluate(() => {
      window.dispatchEvent(new Event('blur'));
      window.dispatchEvent(new Event('focus'));
    });
    const raw = await browser.evaluate(() => localStorage.getItem('wordderby.eventlog') ?? '');
    const types = raw.split('\n').filter(Boolean).map((l) => (JSON.parse(l) as { type: string }).type);
    expect(types).toContain('window_blur');
    expect(types).toContain('window_focus');
  });
});

describe('resilience', { tags: ['logging'] }, () => {
  test('a corrupt saved round is discarded, not crashed on, and logged', async ({ app, screen, browser }) => {
    await browser.addInitScript(() => {
      localStorage.setItem('wordderby.round', JSON.stringify({ words: null, status: 'in_progress' }));
    });
    await app.open('/');
    await expect(screen.getByRole('heading', 'WordDerby')).toBeVisible();
    await expect(screen.getByRole('button', 'A')).toBeVisible();
    const raw = await browser.evaluate(() => localStorage.getItem('wordderby.eventlog') ?? '');
    expect(raw).toContain('saved_round_invalid_shape');
  });
});

describe('agentic play', { tags: ['agent'] }, () => {
  test('a first-time player can finish a round and see the words', async ({ app, agent }) => {
    await app.open('/');
    await agent.act('guess letters, one at a time, until the round ends');
    await agent.assert('the round is over and the words from the round are still visible on screen');
    await agent.assert('a button to play again is available');
  });
});
