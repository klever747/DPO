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
import { SolicitudesService } from './solicitudes.service';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { UpdateSolicitudDto } from './dto/update-solicitud.dto';
import { SOLICITUD_UPLOAD_DIR } from './documento.constants';

const TIPOS_PERMITIDOS = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'image/jpeg',
  'image/png',
]);

@RequireModule('arco')
@Controller('solicitudes-arco')
export class SolicitudesController {
  constructor(private readonly service: SolicitudesService) {}

  @Post('documento')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: SOLICITUD_UPLOAD_DIR,
        filename: (_req, file, cb) => cb(null, `${randomUUID()}${extname(file.originalname)}`),
      }),
      fileFilter: (_req, file, cb) => {
        if (!TIPOS_PERMITIDOS.has(file.mimetype)) {
          return cb(new BadRequestException('Solo se permiten archivos PDF, DOCX, JPG o PNG'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 15 * 1024 * 1024 },
    }),
  )
  subirDocumento(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Archivo requerido');
    return { url: `/solicitudes-arco/documento/${file.filename}` };
  }

  @Get('documento/:filename')
  async descargarDocumento(@Param('filename') filename: string, @Res() res: Response) {
    const safeName = basename(filename);
    const filePath = join(SOLICITUD_UPLOAD_DIR, safeName);
    if (!existsSync(filePath)) throw new NotFoundException('Archivo no encontrado');
    res.sendFile(filePath);
  }

  @Post()
  create(@Body() dto: CreateSolicitudDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto, @CurrentUser() user: JwtPayload) {
    const empresaIds = user.rol === 'super_admin' ? undefined : user.empresaIds;
    return this.service.findAll(query, empresaIds);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSolicitudDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
