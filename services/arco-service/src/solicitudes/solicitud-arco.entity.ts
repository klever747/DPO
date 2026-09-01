import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum TipoDerecho {
  ACCESO = 'acceso',
  RECTIFICACION = 'rectificacion',
  CANCELACION = 'cancelacion',
  OPOSICION = 'oposicion',
  PORTABILIDAD = 'portabilidad',
  LIMITACION = 'limitacion',
}

export enum EstadoSolicitud {
  RECIBIDA = 'recibida',
  EN_PROCESO = 'en_proceso',
  RESUELTA = 'resuelta',
  RECHAZADA = 'rechazada',
}

@Entity({ name: 'solicitudes_arco', schema: 'arco' })
export class SolicitudArco {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @Column({ name: 'titular_nombre' })
  titularNombre: string;

  @Column({ name: 'titular_email', nullable: true })
  titularEmail?: string;

  @Column({ name: 'titular_documento', nullable: true })
  titularDocumento?: string;

  @Column({ name: 'tipo_derecho', type: 'enum', enum: TipoDerecho, enumName: 'tipo_derecho' })
  tipoDerecho: TipoDerecho;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ type: 'enum', enum: EstadoSolicitud, enumName: 'estado_solicitud', default: EstadoSolicitud.RECIBIDA })
  estado: EstadoSolicitud;

  @Column({ name: 'canal_recepcion', nullable: true })
  canalRecepcion?: string;

  @Column({ name: 'fecha_solicitud', type: 'timestamptz' })
  fechaSolicitud: Date;

  @Column({ name: 'fecha_limite', type: 'timestamptz', nullable: true })
  fechaLimite?: Date;

  @Column({ name: 'fecha_resolucion', type: 'timestamptz', nullable: true })
  fechaResolucion?: Date;

  @Column({ type: 'text', nullable: true })
  respuesta?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
