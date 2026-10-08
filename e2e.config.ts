import type { E2EConfig } from 'e2e';
import { web } from '@e2e-dev/web';
import { gateway } from 'ai';

export default {
  // The Vercel AI Gateway serves the model id and reads AI_GATEWAY_API_KEY, or the OIDC token of a linked Vercel project.
  agents: {
    default: {
      model: gateway('openai/gpt-6-luna-fast'),
      system: 'You are a thorough QA agent. Verify every outcome.',
      context:
        'WordDerby is a multi-word letter-guessing game. Letters are guessed with on-screen A-Z buttons. ' +
        'Wrong guesses make the skater fall and use up "falls" before the rink closes. ' +
        'Hidden letters show as thick blank lines.',
    },
  },
  targets: [{
    engine: web(),
    app: {
      url: 'http://127.0.0.1:0',
      command: {
        executable: 'npm',
        args: ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '{port}', '--strictPort'],
        log: '.e2e/logs/app.log',
      },
    },
  }],
} satisfies E2EConfig;

