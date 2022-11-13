import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { YandexApiService } from 'src/modules/core/yandex-api/yandex-api.service';
import { Logger } from '@nestjs/common';
import { Socket } from 'net';

@WebSocketGateway(3001, { cors: true })
export class TracksGateway {
  constructor(private readonly ymService: YandexApiService) {}

  private logger: Logger = new Logger('TracksGateway');

  @SubscribeMessage('getDowloadLink')
  async getDowloadLink(
    client: any,
    payload: { trackId: number },
  ): Promise<any> {
    if (!payload.trackId) {
      return 'No trackId specified';
    }

    const result = await this.ymService.getTrackDirectLink(payload.trackId);

    return result;
  }

  @SubscribeMessage('play')
  async play(client: Socket, payload: { trackId: number }): Promise<any> {
    const { trackId } = payload;

    if (!trackId) {
      return 'No trackId specified';
    }

    const trackInfo = (await this.ymService.getTrack(trackId))[0];
    const downloadUrl = await this.ymService.getTrackDirectLink(trackId);

    if (Object.keys(trackInfo).length === 0) {
      return 'No track found';
    }

    const result = {
      title: trackInfo.title,
      authors: trackInfo.artists,
      imgSrc: this.makeValidCoverImage(trackInfo.coverUri),

      trackUrl: downloadUrl,
    };

    this.logger.debug(`Response`, result);

    client.emit('track_added', result);

    return result;
  }

  private makeValidCoverImage(url: string): string {
    const urlParts = url.split('/%%');
    const result = 'https://' + urlParts[0] + '/400x400';

    return result;
  }
}
