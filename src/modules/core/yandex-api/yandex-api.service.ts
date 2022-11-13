import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {
  GetTrackDownloadInfoResponse,
  GetTrackResponse,
  IAuthorizeParams,
  InitResponse,
  IYandexApi,
  ObjectResponse,
  SearchOptions,
  SearchResponse,
  TrackId,
} from 'src/interfaces';
import { firstValueFrom } from 'rxjs';
import { Parser } from 'xml2js';
import * as crypto from 'crypto';
import * as url from 'url';

const YANDEX_URL = 'https://api.music.yandex.net:443';
const AUTH_URL = 'https://oauth.mobile.yandex.net:443';

const config = {
  oauth: {
    CLIENT_ID: '23cabbbdc6cd418abb4b39c32c41195d',
    CLIENT_SECRET: '53bc75238f0c4d08a118e51fe9203300',
  },
};

// TODO-ME multi account

@Injectable()
export class YandexApiService implements IYandexApi {
  private user = {
    // password: '',
    token: '',
    uid: 0,
    // username: '',
  };

  private counter = 0;

  constructor(private readonly httpService: HttpService) {}

  private getAuthHeader(): { Authorization: string } {
    return {
      Authorization: `OAuth ${this.user.token}`,
    };
  }
  getAuthHeaderPub(): any {
    return {
      counter: ++this.counter,
    };
  }
  async authorize(params: IAuthorizeParams): Promise<InitResponse> {
    if (!params.username || !params.password) {
      throw new Error('Credentials are required');
    }

    console.log(params);

    const dataToReq = new url.URLSearchParams({
      grant_type: 'password',
      username: params.username,
      password: params.password,
      client_id: config.oauth.CLIENT_ID,
      client_secret: config.oauth.CLIENT_SECRET,
    });

    const { data } = await firstValueFrom(
      this.httpService
        .post<ObjectResponse>(AUTH_URL + '/1/token', dataToReq.toString())
        .pipe(),
    );

    this.user.token = data.access_token;
    this.user.uid = data.uid;

    return {
      access_token: data.access_token,
      uid: data.uid,
    };
  }

  getUserInfo(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async getTracks(): Promise<void> {
    return;
  }

  async getTrack(trackId: TrackId): Promise<GetTrackResponse> {
    const { data } = await firstValueFrom(
      this.httpService
        .get<{ invocationInfo: any; result: GetTrackResponse }>(
          YANDEX_URL + '/tracks/' + trackId,
          {
            headers: this.getAuthHeader(),
          },
        )
        .pipe(),
    );

    return data.result;
  }

  async search(
    query: string,
    options: SearchOptions = {},
  ): Promise<SearchResponse> {
    const type = !options.type ? 'all' : options.type;
    const page = String(!options.page ? 0 : options.page);
    const nococrrect = String(
      options.nococrrect == null ? false : options.nococrrect,
    );

    const { data } = await firstValueFrom(
      this.httpService
        .get<SearchResponse>(YANDEX_URL + '/search', {
          headers: this.getAuthHeader(),
          params: {
            type,
            text: query,
            page,
            nococrrect,
          },
        })
        .pipe(),
    );

    return data;
  }

  async getTrackDownloadInfo(
    trackId: number,
  ): Promise<GetTrackDownloadInfoResponse> {
    // throw new Error('Method not implemented.');

    if (!trackId) {
      //   return 'No track id specified';
      throw new Error('No track id specified.');
    }

    const { data } = await firstValueFrom(
      this.httpService
        .get<GetTrackDownloadInfoResponse>(
          YANDEX_URL + `/tracks/${trackId}/download-info`,
          { headers: this.getAuthHeader() },
        )
        .pipe(),
    );

    return data;
  }

  async getTrackDirectLink(trackId: number): Promise<string> {
    const info = (await this.getTrackDownloadInfo(trackId)) as any;

    const { downloadInfoUrl } = info.result[0];

    // console.log(1, downloadInfoUrl);

    const { data } = await firstValueFrom(
      this.httpService
        .get(downloadInfoUrl, { headers: this.getAuthHeader() })
        .pipe(),
    );

    console.log(2, data, this.getAuthHeader());

    const parser = new Parser();

    const parsedXml = await parser.parseStringPromise(data);

    const host = parsedXml['download-info'].host[0];
    const path = parsedXml['download-info'].path[0];
    const ts = parsedXml['download-info'].ts[0];
    const s = parsedXml['download-info'].s[0];
    const sign = crypto
      .createHash('md5')
      .update('XGRlBW9FXlekgbPrRHuSiA' + path.slice(1) + s)
      .digest('hex');

    return `https://${host}/get-mp3/${sign}/${ts}${path}`;
  }
}
