import manifest from './manifest.json';

describe('web app manifest', () => {
  it('has install-ready PWA metadata', () => {
    expect(manifest.name).toBe('pray.bh - Bahrain Prayer Times');
    expect(manifest.short_name).toBe('pray.bh');
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBe('/?source=pwa');
    expect(manifest.scope).toBe('/');
    expect(manifest.lang).toBe('en-BH');
  });

  it('includes useful home screen shortcuts', () => {
    expect(manifest.shortcuts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Fajr time', url: '/prayer/fajr?source=pwa-shortcut' }),
        expect.objectContaining({ name: 'Manama times', url: '/city/manama?source=pwa-shortcut' }),
      ]),
    );
  });
});
