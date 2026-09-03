import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrechaSeguridad } from './brecha-seguridad.entity';
import { BrechasService } from './brechas.service';
import { BrechasController } from './brechas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BrechaSeguridad])],
  controllers: [BrechasController],
  providers: [BrechasService],
  exports: [BrechasService],
})
export class BrechasModule {}
