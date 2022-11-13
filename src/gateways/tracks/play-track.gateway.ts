import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { YandexApiService } from 'src/modules/core/yandex-api/yandex-api.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway(3001)
export class PlayTrackGateway {
  constructor(private readonly ymService: YandexApiService) {}

  private logger: Logger = new Logger();

  @SubscribeMessage('playTrack')
  async handleMessage(client: any, payload: { trackId: number }): Promise<any> {
    const { trackId } = payload;

    this.logger.debug(`requested`, trackId);

    if (!trackId) {
      return 'No trackId specified';
    }

    const trackInfo = (await this.ymService.getTrack(trackId))[0];
    const downloadUrl = await this.ymService.getTrackDirectLink(trackId);

    const result = {
      title: trackInfo.title,
      authors: trackInfo.artists,
      imgSrc: trackInfo.coverUri,
      trackUrl: downloadUrl,
    };

    this.logger.debug(`Response`, result);

    return result;
  }
}
