import { readFileSync } from 'fs';
import { join } from 'path';

describe('service worker caching policy', () => {
  const serviceWorkerSource = readFileSync(join(process.cwd(), 'public/sw.js'), 'utf8');

  it('does not precache the dynamic home page with daily prayer times', () => {
    const urlsMatch = serviceWorkerSource.match(/STATIC_URLS_TO_CACHE\s*=\s*\[([\s\S]*?)\]/);

    expect(urlsMatch?.[1]).toBeDefined();
    expect(urlsMatch?.[1]).not.toContain("'/'");
    expect(urlsMatch?.[1]).not.toContain('"/"');
  });

  it('serves navigation/document requests network-first to prevent stale prayer times', () => {
    expect(serviceWorkerSource).toContain("request.mode === 'navigate'");
    expect(serviceWorkerSource).toContain("request.destination === 'document'");
    expect(serviceWorkerSource).toMatch(/fetch\(request\)\.catch\(\(\) => caches\.match\(request\)\)/);
  });
});
