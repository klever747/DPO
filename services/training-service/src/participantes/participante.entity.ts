import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Formacion } from '../formaciones/formacion.entity';

export enum EstadoParticipante {
  INSCRITO = 'inscrito',
  COMPLETADO = 'completado',
  NO_COMPLETADO = 'no_completado',
}

@Entity({ name: 'formacion_participantes', schema: 'training' })
export class Participante {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'formacion_id', type: 'uuid' })
  formacionId: string;

  @ManyToOne(() => Formacion, (formacion) => formacion.participantes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'formacion_id' })
  formacion?: Formacion;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ type: 'enum', enum: EstadoParticipante, enumName: 'estado_participante', default: EstadoParticipante.INSCRITO })
  estado: EstadoParticipante;

  @Column({ name: 'fecha_completado', type: 'timestamptz', nullable: true })
  fechaCompletado?: Date;

  @Column({ type: 'numeric', precision: 4, scale: 1, nullable: true })
  calificacion?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
