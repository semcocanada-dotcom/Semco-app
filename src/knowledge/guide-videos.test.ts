import { findGuideVideos, GUIDE_VIDEOS } from './guide-videos';

describe('curated SEMCO video references', () => {
  it('contains only verified, uniquely identified manufacturer videos with honest review scope', () => {
    expect(new Set(GUIDE_VIDEOS.map(video => video.id)).size).toBe(GUIDE_VIDEOS.length);
    for (const video of GUIDE_VIDEOS) {
      expect(video.id).toMatch(/^[\w-]{11}$/);
      expect(video.url).toBe(`https://www.youtube.com/watch?v=${video.id}`);
      expect(video.provenance).toBe('official-channel');
      expect(video.reviewLevel).toBe('catalogue-metadata');
      expect(video.verifiedSourceUrl).toBe('https://www.youtube.com/@semcomfg/videos');
    }
  });

  it('selects current application videos ahead of general product overviews', () => {
    expect(findGuideVideos('How do I apply liquid membrane?')[0].id).toBe('SXtjSHoXV6s');
    expect(findGuideVideos('How do I apply X-Bond?')[0].id).toBe('_Bi9KJeB_Js');
    expect(findGuideVideos('How do I roll Satin Stone?')[0].id).toBe('p_7Ig98m8P8');
  });

  it('routes specific steps, surfaces and product uses without confusing names', () => {
    expect(findGuideVideos('Show me an Xbond scratch coat video')[0].id).toBe('W06jti_-JCo');
    expect(findGuideVideos('How do I apply MicroBond over X-Bond on walls?')[0].id).toBe('q8VjSMfZtu0');
    expect(findGuideVideos('What is Natural Shield used for?').map(video => video.id)).toEqual(['meufPYjz_2k']);
    expect(findGuideVideos('How do I form a cove base?')[0].id).toBe('bKNC4YqpGIg');
    expect(findGuideVideos('How do I clean and prep?')[0].id).toBe('KoBdCV8nw3c');
  });

  it('does not supply a random or archived substitute for an unverified product video', () => {
    expect(findGuideVideos('How do I apply the current Matte sealer?')).toEqual([]);
    expect(findGuideVideos('How do I use Power Cleaner?')).toEqual([]);
    expect(findGuideVideos('What is my order status?')).toEqual([]);
    expect(findGuideVideos('Show me a video')).toEqual([]);
  });

  it('limits links and needs no network or transcript claims', () => {
    expect(findGuideVideos('liquid membrane', 1)).toHaveLength(1);
    expect(findGuideVideos('liquid membrane', 100)).toHaveLength(3);
    expect(findGuideVideos('liquid membrane', 0)).toEqual([]);
    expect(findGuideVideos('liquid membrane', Number.NaN)).toEqual([]);
  });
});
