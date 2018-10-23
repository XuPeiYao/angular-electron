import { YoutubePlayerModule } from './youtube-player.module';

describe('YoutubePlayerModule', () => {
  let youtubePlayerModule: YoutubePlayerModule;

  beforeEach(() => {
    youtubePlayerModule = new YoutubePlayerModule();
  });

  it('should create an instance', () => {
    expect(youtubePlayerModule).toBeTruthy();
  });
});
