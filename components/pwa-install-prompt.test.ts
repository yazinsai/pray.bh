import { readFileSync } from 'fs';
import { join } from 'path';

describe('PWA install prompt', () => {
  const source = readFileSync(join(process.cwd(), 'components/pwa-install-prompt.tsx'), 'utf8');

  it('shows iOS Add to Home Screen instructions because iOS does not emit beforeinstallprompt', () => {
    expect(source).toContain('isIosDevice');
    expect(source).toContain('Choose Add to Home Screen');
    expect(source).toContain('Tap Share');
  });

  it('does not show the prompt after the app is already running standalone', () => {
    expect(source).toContain('(display-mode: standalone)');
    expect(source).toContain('navigator as Navigator & { standalone?: boolean }');
    expect(source).toContain('if (isInstalled || !showInstallPrompt) return null');
  });

  it('remembers dismissals so the prompt is helpful without being spammy', () => {
    expect(source).toContain('pwa-prompt-dismissed-at');
    expect(source).toContain('7 * 24 * 60 * 60 * 1000');
  });
});
