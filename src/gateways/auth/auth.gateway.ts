import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { YandexApiService } from 'src/modules/core/yandex-api/yandex-api.service';

@WebSocketGateway(3001, { cors: true })
export class AuthGateway {
  constructor(private readonly ymService: YandexApiService) {}

  @SubscribeMessage('auth')
  async handleMessage(client: any, payload: any): Promise<any> {
    if (!payload.username || !payload.password) {
      // throw new Error('Username and password are required');
      return 'Username and password are required';
    }

    const authData = await this.ymService.authorize({
      username: payload.username,
      password: payload.password,
    });

    return authData;
  }
}
