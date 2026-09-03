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
import { CurrentUser, JwtPayload, PaginationQueryDto, RequireModule, Roles } from '@dpo/common';
import { PlantillasService } from './plantillas.service';
import { CreatePlantillaDto } from './dto/create-plantilla.dto';
import { UpdatePlantillaDto } from './dto/update-plantilla.dto';
import { PLANTILLA_UPLOAD_DIR } from './documento.constants';

const TIPOS_PERMITIDOS = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
]);

@RequireModule('contratos')
@Controller('plantillas-contrato')
export class PlantillasController {
  constructor(private readonly service: PlantillasService) {}

  @Roles('super_admin', 'admin_empresa', 'dpo')
  @Post('documento')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: PLANTILLA_UPLOAD_DIR,
        filename: (_req, file, cb) => cb(null, `${randomUUID()}${extname(file.originalname)}`),
      }),
      fileFilter: (_req, file, cb) => {
        if (!TIPOS_PERMITIDOS.has(file.mimetype)) {
          return cb(new BadRequestException('Solo se permiten archivos .docx o .pdf'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  subirDocumento(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Archivo requerido');
    return { url: `/plantillas-contrato/documento/${file.filename}` };
  }

  @Get('documento/:filename')
  async descargarDocumento(@Param('filename') filename: string, @Res() res: Response) {
    const safeName = basename(filename);
    const filePath = join(PLANTILLA_UPLOAD_DIR, safeName);
    if (!existsSync(filePath)) throw new NotFoundException('Archivo no encontrado');
    res.sendFile(filePath);
  }

  @Roles('super_admin', 'admin_empresa', 'dpo')
  @Post()
  create(@Body() dto: CreatePlantillaDto) {
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

  @Roles('super_admin', 'admin_empresa', 'dpo')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePlantillaDto) {
    return this.service.update(id, dto);
  }

  @Roles('super_admin', 'admin_empresa', 'dpo')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
