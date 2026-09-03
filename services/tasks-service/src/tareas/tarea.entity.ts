import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum EstadoTarea {
  PENDIENTE = 'pendiente',
  EN_REVISION = 'en_revision',
  COMPLETADA = 'completada',
  RECHAZADA = 'rechazada',
}

@Entity({ name: 'tareas', schema: 'tasks' })
export class Tarea {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  /** Referencia lógica a auth.departamentos (servicio distinto, sin FK física). */
  @Column({ name: 'departamento_id', type: 'uuid', nullable: true })
  departamentoId?: string;

  @Column({ name: 'departamento_nombre', nullable: true })
  departamentoNombre?: string;

  /** Referencia lógica a auth.usuarios (el jefe de área asignado). */
  @Column({ name: 'asignado_a_id', type: 'uuid' })
  asignadoAId: string;

  @Column({ name: 'asignado_a_nombre' })
  asignadoANombre: string;

  @Column({ name: 'asignado_a_email', nullable: true })
  asignadoAEmail?: string;

  @Column()
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  /** Artículo/norma que justifica la tarea, ej. "Art. 15 LOPDP". */
  @Column({ name: 'base_legal', nullable: true })
  baseLegal?: string;

  @Column({ name: 'fecha_limite', type: 'date' })
  fechaLimite: string;

  @Column({ type: 'enum', enum: EstadoTarea, enumName: 'estado_tarea', default: EstadoTarea.PENDIENTE })
  estado: EstadoTarea;

  @Column({ name: 'evidencia_url', nullable: true })
  evidenciaUrl?: string;

  @Column({ name: 'fecha_completada', type: 'timestamptz', nullable: true })
  fechaCompletada?: Date;

  @Column({ name: 'revisado_por_email', nullable: true })
  revisadoPorEmail?: string;

  @Column({ name: 'comentario_revision', type: 'text', nullable: true })
  comentarioRevision?: string;

  @Column({ name: 'fecha_revision', type: 'timestamptz', nullable: true })
  fechaRevision?: Date;

  @Column({ name: 'creado_por_email', nullable: true })
  creadoPorEmail?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
