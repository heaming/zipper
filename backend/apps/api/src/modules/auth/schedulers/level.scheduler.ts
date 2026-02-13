import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LevelService } from '../services/level.service';

@Injectable()
export class LevelScheduler {
  private readonly logger = new Logger(LevelScheduler.name);

  constructor(private readonly levelService: LevelService) {}

  /**
   * 매일 새벽 2시에 모든 사용자 레벨 재계산
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async recalculateAllLevels() {
    this.logger.log('Starting level recalculation for all users...');
    try {
      await this.levelService.recalculateAllLevels();
      this.logger.log('Level recalculation completed successfully');
    } catch (error) {
      this.logger.error(`Error during level recalculation: ${error.message}`, error.stack);
    }
  }
}
