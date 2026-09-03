import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
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
import { TareasService } from './tareas.service';
import { CreateTareaDto } from './dto/create-tarea.dto';
import { UpdateTareaDto } from './dto/update-tarea.dto';
import { RevisarTareaDto } from './dto/revisar-tarea.dto';
import { EVIDENCIA_UPLOAD_DIR } from './documento.constants';

const TIPOS_PERMITIDOS = new Set(['application/pdf', 'image/jpeg', 'image/png']);
const ROLES_REVISORES = new Set(['super_admin', 'admin_empresa', 'dpo', 'auditor']);

@RequireModule('tareas')
@Controller('tareas')
export class TareasController {
  constructor(private readonly service: TareasService) {}

  @Roles('super_admin', 'admin_empresa', 'dpo')
  @Post()
  create(@Body() dto: CreateTareaDto, @CurrentUser() user: JwtPayload) {
    return this.service.create(dto, user.email);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto, @CurrentUser() user: JwtPayload) {
    const empresaIds = user.rol === 'super_admin' ? undefined : user.empresaIds;
    return this.service.findAll(query, empresaIds, user.sub, user.rol);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Roles('super_admin', 'admin_empresa', 'dpo')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTareaDto) {
    return this.service.update(id, dto);
  }

  @Roles('super_admin', 'admin_empresa', 'dpo')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/evidencia')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: EVIDENCIA_UPLOAD_DIR,
        filename: (_req, file, cb) => cb(null, `${randomUUID()}${extname(file.originalname)}`),
      }),
      fileFilter: (_req, file, cb) => {
        if (!TIPOS_PERMITIDOS.has(file.mimetype)) {
          return cb(new BadRequestException('Solo se permiten archivos PDF, JPG o PNG'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 15 * 1024 * 1024 },
    }),
  )
  async subirEvidencia(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @CurrentUser() user: JwtPayload) {
    if (!file) throw new BadRequestException('Archivo requerido');
    const tarea = await this.service.findOne(id);
    if (!ROLES_REVISORES.has(user.rol) && tarea.asignadoAId !== user.sub) {
      throw new ForbiddenException('Solo la persona asignada puede adjuntar la evidencia de esta tarea');
    }
    return this.service.adjuntarEvidencia(id, `/tareas/evidencia/${file.filename}`);
  }

  @Get('evidencia/:filename')
  async descargarEvidencia(@Param('filename') filename: string, @Res() res: Response) {
    const safeName = basename(filename);
    const filePath = join(EVIDENCIA_UPLOAD_DIR, safeName);
    if (!existsSync(filePath)) throw new NotFoundException('Archivo no encontrado');
    res.sendFile(filePath);
  }

  @Roles('super_admin', 'admin_empresa', 'dpo', 'auditor')
  @Post(':id/revisar')
  revisar(@Param('id') id: string, @Body() dto: RevisarTareaDto, @CurrentUser() user: JwtPayload) {
    return this.service.revisar(id, dto, user.email);
  }

  @Roles('super_admin', 'admin_empresa', 'dpo', 'auditor')
  @Post(':id/recordatorio')
  enviarRecordatorio(@Param('id') id: string) {
    return this.service.enviarRecordatorio(id);
  }
}
