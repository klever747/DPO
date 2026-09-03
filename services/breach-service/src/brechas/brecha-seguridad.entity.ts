import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum NivelRiesgo {
  BAJO = 'bajo',
  MEDIO = 'medio',
  ALTO = 'alto',
  CRITICO = 'critico',
}

export enum EstadoBrecha {
  ABIERTA = 'abierta',
  EN_INVESTIGACION = 'en_investigacion',
  CONTENIDA = 'contenida',
  CERRADA = 'cerrada',
}

@Entity({ name: 'brechas_seguridad', schema: 'breach' })
export class BrechaSeguridad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @Column()
  titulo: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ name: 'categorias_datos_afectados', type: 'text', array: true, default: () => "'{}'" })
  categoriasDatosAfectados: string[];

  @Column({ name: 'num_afectados', type: 'int', nullable: true })
  numAfectados?: number;

  @Column({ name: 'nivel_riesgo', type: 'enum', enum: NivelRiesgo, enumName: 'nivel_riesgo', default: NivelRiesgo.MEDIO })
  nivelRiesgo: NivelRiesgo;

  @Column({ name: 'fecha_deteccion', type: 'timestamptz' })
  fechaDeteccion: Date;

  @Column({ name: 'fecha_notificacion_autoridad', type: 'timestamptz', nullable: true })
  fechaNotificacionAutoridad?: Date;

  @Column({ name: 'fecha_notificacion_afectados', type: 'timestamptz', nullable: true })
  fechaNotificacionAfectados?: Date;

  @Column({ name: 'notificada_autoridad', default: false })
  notificadaAutoridad: boolean;

  @Column({ name: 'notificada_afectados', default: false })
  notificadaAfectados: boolean;

  @Column({ name: 'medidas_adoptadas', type: 'text', nullable: true })
  medidasAdoptadas?: string;

  @Column({ type: 'enum', enum: EstadoBrecha, enumName: 'estado_brecha', default: EstadoBrecha.ABIERTA })
  estado: EstadoBrecha;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
