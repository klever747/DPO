import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { createHash } from 'crypto';
import { existsSync, readFileSync } from 'fs';
import { basename, extname, join } from 'path';
import { randomUUID } from 'crypto';
import type { Response } from 'express';
import { CurrentUser, JwtPayload, PaginationQueryDto, RequireModule } from '@dpo/common';
import { EvidenciasService } from './evidencias.service';
import { CreateEvidenciaDto } from './dto/create-evidencia.dto';
import { EVIDENCIA_UPLOAD_DIR } from './documento.constants';

@RequireModule('evidencias')
@Controller('evidencias')
export class EvidenciasController {
  constructor(private readonly service: EvidenciasService) {}

  @Post('documento')
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
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  subirDocumento(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Archivo requerido');
    const hash = createHash('sha256').update(readFileSync(file.path)).digest('hex');
    return {
      url: `/evidencias/documento/${file.filename}`,
      nombreArchivo: file.originalname,
      hashIntegridad: hash,
    };
  }

  @Get('documento/:filename')
  async descargarDocumento(@Param('filename') filename: string, @Res() res: Response) {
    const safeName = basename(filename);
    const filePath = join(EVIDENCIA_UPLOAD_DIR, safeName);
    if (!existsSync(filePath)) throw new NotFoundException('Archivo no encontrado');
    res.sendFile(filePath);
  }

  @Post()
  create(@Body() dto: CreateEvidenciaDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto, @CurrentUser() user: JwtPayload) {
    const empresaIds = user.rol === 'super_admin' ? undefined : user.empresaIds;
    return this.service.findAll(query, empresaIds);
  }

  @Get('referencia/:moduloOrigen/:referenciaId')
  findByReferencia(
    @Param('moduloOrigen') moduloOrigen: string,
    @Param('referenciaId') referenciaId: string,
  ) {
    return this.service.findByReferencia(moduloOrigen, referenciaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
