import { Module } from '@nestjs/common';
import { YandexApiModule } from 'src/modules/core/yandex-api/yandex-api.module';
import { AuthGateway } from './auth/auth.gateway';
import { CommonGateway } from './common/common.gateway';
import { TracksGateway } from './tracks/tracks.gateway';

@Module({
  imports: [YandexApiModule],
  providers: [AuthGateway, CommonGateway, TracksGateway],
})
export class GatewaysModule {}
