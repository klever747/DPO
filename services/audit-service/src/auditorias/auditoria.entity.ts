import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { HallazgoAuditoria } from '../hallazgos/hallazgo-auditoria.entity';

export enum TipoAuditoria {
  INTERNA = 'interna',
  EXTERNA = 'externa',
  SEGUIMIENTO = 'seguimiento',
}

export enum EstadoAuditoria {
  PLANIFICADA = 'planificada',
  EN_CURSO = 'en_curso',
  FINALIZADA = 'finalizada',
}

@Entity({ name: 'auditorias', schema: 'audit' })
export class Auditoria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @Column({ type: 'enum', enum: TipoAuditoria, enumName: 'tipo_auditoria', default: TipoAuditoria.INTERNA })
  tipo: TipoAuditoria;

  @Column({ type: 'text', nullable: true })
  alcance?: string;

  @Column({ nullable: true })
  auditor?: string;

  @Column({ name: 'fecha_inicio', type: 'date', nullable: true })
  fechaInicio?: string;

  @Column({ name: 'fecha_fin', type: 'date', nullable: true })
  fechaFin?: string;

  @Column({ type: 'enum', enum: EstadoAuditoria, enumName: 'estado_auditoria', default: EstadoAuditoria.PLANIFICADA })
  estado: EstadoAuditoria;

  @Column({ name: 'resultado_general', type: 'text', nullable: true })
  resultadoGeneral?: string;

  @OneToMany(() => HallazgoAuditoria, (hallazgo) => hallazgo.auditoria)
  hallazgos?: HallazgoAuditoria[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
