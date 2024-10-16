import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  listVersions() {
    return this.configService.get<string[]>('app.versioning.defaultVersion');
  }
}
