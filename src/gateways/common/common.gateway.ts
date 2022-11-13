import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { YandexApiService } from 'src/modules/core/yandex-api/yandex-api.service';

@WebSocketGateway(3001, { cors: true })
export class CommonGateway {
  constructor(private readonly ymService: YandexApiService) {}

  @SubscribeMessage('search')
  async handleMessage(client: any, payload: any): Promise<any> {
    if (!payload.query) {
      return 'Nothing to search';
    }

    const result = await this.ymService.search(payload.query);

    return result;
  }
}
