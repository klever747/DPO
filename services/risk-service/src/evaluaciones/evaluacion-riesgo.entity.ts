import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum NivelRiesgo {
  BAJO = 'bajo',
  MEDIO = 'medio',
  ALTO = 'alto',
  CRITICO = 'critico',
}

export enum EstadoRiesgo {
  PENDIENTE = 'pendiente',
  EN_TRATAMIENTO = 'en_tratamiento',
  MITIGADO = 'mitigado',
  ACEPTADO = 'aceptado',
}

@Entity({ name: 'evaluaciones_riesgo', schema: 'risk' })
export class EvaluacionRiesgo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'empresa_id' })
  empresaId: string;

  @Column({ name: 'actividad_id', nullable: true })
  actividadId?: string;

  @Column({ name: 'actividad_nombre' })
  actividadNombre: string;

  @Column({ name: 'descripcion_riesgo', type: 'text' })
  descripcionRiesgo: string;

  @Column({ type: 'smallint' })
  probabilidad: number;

  @Column({ type: 'smallint' })
  impacto: number;

  @Column({ name: 'nivel_riesgo', type: 'enum', enum: NivelRiesgo, enumName: 'nivel_riesgo' })
  nivelRiesgo: NivelRiesgo;

  @Column({ name: 'medidas_mitigacion', type: 'text', nullable: true })
  medidasMitigacion?: string;

  @Column({ name: 'requiere_consulta_previa', default: false })
  requiereConsultaPrevia: boolean;

  @Column({ name: 'responsable_id', nullable: true })
  responsableId?: string;

  @Column({ name: 'responsable_nombre', nullable: true })
  responsableNombre?: string;

  @Column({ name: 'responsable_email', nullable: true })
  responsableEmail?: string;

  @Column({ type: 'enum', enum: EstadoRiesgo, enumName: 'estado_riesgo', default: EstadoRiesgo.PENDIENTE })
  estado: EstadoRiesgo;

  @Column({ name: 'fecha_evaluacion', type: 'date' })
  fechaEvaluacion: string;

  @Column({ name: 'fecha_reevaluacion', type: 'date', nullable: true })
  fechaReevaluacion?: string;

  @Column({ name: 'creado_por_email', nullable: true })
  creadoPorEmail?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
