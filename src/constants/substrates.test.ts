import { formatSubstrateLabel, SUBSTRATE_MAP } from '@/constants/substrates';

describe('substrate labels', () => {
  it('presents the persisted cement_board ID as the broader approved wet-area option', () => {
    expect(SUBSTRATE_MAP.cement_board.label).toBe('Wet-Area Board');
    expect(SUBSTRATE_MAP.cement_board.description).toContain('moisture-resistant');
    expect(formatSubstrateLabel('cement_board')).toBe('Wet-Area Board');
  });

  it('keeps unknown legacy substrate values readable', () => {
    expect(formatSubstrateLabel('custom_wall_panel')).toBe('Custom Wall Panel');
    expect(formatSubstrateLabel(null)).toBe('Not set');
  });
});
