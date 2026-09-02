import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync } from 'fs';
import { basename, extname, join } from 'path';
import { randomUUID } from 'crypto';
import type { Response } from 'express';
import { CurrentUser, JwtPayload, PaginationQueryDto, RequireModule } from '@dpo/common';
import { ConsentimientosService } from './consentimientos.service';
import { CreateConsentimientoDto } from './dto/create-consentimiento.dto';
import { UpdateConsentimientoDto } from './dto/update-consentimiento.dto';
import { EVIDENCIA_UPLOAD_DIR } from './evidencia.constants';

@RequireModule('consentimientos')
@Controller('consentimientos')
export class ConsentimientosController {
  constructor(private readonly service: ConsentimientosService) {}

  @Post('evidencia')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: EVIDENCIA_UPLOAD_DIR,
        filename: (_req, file, cb) => cb(null, `${randomUUID()}${extname(file.originalname)}`),
      }),
      fileFilter: (_req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          return cb(new BadRequestException('Solo se permiten archivos PDF'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  subirEvidencia(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Archivo requerido');
    return { url: `/consentimientos/evidencia/${file.filename}` };
  }

  @Get('evidencia/:filename')
  async descargarEvidencia(@Param('filename') filename: string, @Res() res: Response) {
    const safeName = basename(filename);
    const filePath = join(EVIDENCIA_UPLOAD_DIR, safeName);
    if (!existsSync(filePath)) throw new NotFoundException('Archivo no encontrado');
    res.sendFile(filePath);
  }

  @Post()
  create(@Body() dto: CreateConsentimientoDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto, @CurrentUser() user: JwtPayload) {
    const empresaIds = user.rol === 'super_admin' ? undefined : user.empresaIds;
    return this.service.findAll(query, empresaIds);
  }

  @Get('titular/:titularId')
  findByTitular(@Param('titularId') titularId: string) {
    return this.service.findByTitular(titularId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateConsentimientoDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/revocar')
  revocar(@Param('id') id: string) {
    return this.service.revocar(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
