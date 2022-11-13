import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { YandexApiService } from './yandex-api.service';

@Module({
  imports: [HttpModule],
  providers: [YandexApiService],
  exports: [YandexApiService],
})
export class YandexApiModule {}
