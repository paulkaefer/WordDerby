Searched for files matching `**/{e2e.config.*,tests/**/*.e2e.ts,.agents/**,.e2e/**}`, 11 matches

Read skill `e2e`
...
I added an end-to-end suite and configured the runner to start the app itself. The 16 non-agent tests pass (about 15 s), but I did not run the one agentic test because it needs a model key.

I ran `npm install` first because the e2e packages weren't installed yet.

**`e2e.config.ts`**
- The runner now starts `npm run dev` on a free port, so you don't need to start the server by hand.
- I added a short description of the game to the agent's context.

**`wordderby.e2e.ts`**
- **Seeded round:** most tests start from a saved round with the single word CAT and 7 falls. The word is fixed, so the tests are deterministic, and the round survives reloads.
- **Game (10 tests):**
  - starting state;
  - a correct guess (clock unchanged);
  - a wrong guess (clock advances and the key is marked wrong);
  - a repeated letter (no penalty);
  - physical keyboard input, and Ctrl+A not counting as a guess;
  - a win keeps the word visible;
  - a loss shows the answer with the missed letters marked;
  - progress surviving a reload;
  - "Solve it for me" showing "Solved with a little help!";
  - "Play again" starting a fresh round.
- **Categories (2 tests):**
  - "Start a new round now" with only Space picked produces only space words;
  - the chosen category persists across a reload.
- **Event log (3 tests):** guesses carry the letter, outcome and strikes remaining, with ISO 8601 timestamps and a gap-free sequence. Word completion, round end, and window blur/focus events are also checked.
- **Resilience (1 test):** a corrupt saved round is discarded and logged instead of crashing the page.
- **Agentic (1 test):** `agent.act` plays a real round, then `agent.assert` checks the round is over, the words are visible and "Play again" is available. This is the one that needs the model key (`AI_GATEWAY_API_KEY`).

To run them, use `npx e2e run`. Add `--tag game`, `--tag categories` or `--tag logging` to pick a group. Add `--tag agent` to run the agent test.

The clock text isn't exposed as a named status, so the tests match it by its visible text. Giving that status an accessible name would make the tests, and screen readers, more robust. I haven't done that.
