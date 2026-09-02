import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sector } from './sector.entity';
import { SectoresService } from './sectores.service';
import { SectoresController } from './sectores.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Sector])],
  controllers: [SectoresController],
  providers: [SectoresService],
  exports: [SectoresService],
})
export class SectoresModule {}
