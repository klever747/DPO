import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Titular } from '../titulares/titular.entity';

export enum CanalConsentimiento {
  WEB = 'web',
  APP = 'app',
  PAPEL = 'papel',
  TELEFONO = 'telefono',
  EMAIL = 'email',
  PRESENCIAL = 'presencial',
}

export enum EstadoConsentimiento {
  OTORGADO = 'otorgado',
  REVOCADO = 'revocado',
  EXPIRADO = 'expirado',
}

export enum EstadoDocumento {
  FIRMADO = 'firmado',
  EN_PROCESO = 'en_proceso',
  NO_AUTORIZADO = 'no_autorizado',
}

export enum TipoArchivo {
  FISICO = 'fisico',
  DIGITAL = 'digital',
  ESCANEADO = 'escaneado',
  OTRO = 'otro',
}

@Entity({ name: 'consentimientos', schema: 'consent' })
export class Consentimiento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @Column({ name: 'titular_id', type: 'uuid' })
  titularId: string;

  @ManyToOne(() => Titular, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'titular_id' })
  titular?: Titular;

  @Column()
  finalidad: string;

  @Column({ name: 'base_legal', nullable: true })
  baseLegal?: string;

  @Column({ type: 'enum', enum: CanalConsentimiento, enumName: 'canal_consentimiento', default: CanalConsentimiento.WEB })
  canal: CanalConsentimiento;

  @Column({ name: 'version_texto_legal', nullable: true })
  versionTextoLegal?: string;

  @Column({ type: 'enum', enum: EstadoConsentimiento, enumName: 'estado_consentimiento', default: EstadoConsentimiento.OTORGADO })
  estado: EstadoConsentimiento;

  @Column({ name: 'estado_documento', type: 'enum', enum: EstadoDocumento, enumName: 'estado_documento', default: EstadoDocumento.EN_PROCESO })
  estadoDocumento: EstadoDocumento;

  @Column({ name: 'tipo_archivo', type: 'enum', enum: TipoArchivo, enumName: 'tipo_archivo', default: TipoArchivo.DIGITAL })
  tipoArchivo: TipoArchivo;

  @Column({ name: 'fecha_otorgamiento', type: 'timestamptz' })
  fechaOtorgamiento: Date;

  @Column({ name: 'fecha_revocacion', type: 'timestamptz', nullable: true })
  fechaRevocacion?: Date | null;

  @Column({ name: 'ip_origen', nullable: true })
  ipOrigen?: string;

  @Column({ name: 'evidencia_url', nullable: true })
  evidenciaUrl?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
