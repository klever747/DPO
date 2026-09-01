import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Participante } from '../participantes/participante.entity';

export enum TipoFormacion {
  PRESENCIAL = 'presencial',
  ONLINE = 'online',
  ELEARNING = 'elearning',
}

@Entity({ name: 'formaciones', schema: 'training' })
export class Formacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @Column()
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ type: 'enum', enum: TipoFormacion, enumName: 'tipo_formacion', default: TipoFormacion.ELEARNING })
  tipo: TipoFormacion;

  @Column({ name: 'fecha_inicio', type: 'date', nullable: true })
  fechaInicio?: string;

  @Column({ name: 'fecha_fin', type: 'date', nullable: true })
  fechaFin?: string;

  @Column({ name: 'duracion_horas', type: 'numeric', precision: 5, scale: 1, nullable: true })
  duracionHoras?: number;

  @Column({ default: false })
  obligatoria: boolean;

  @OneToMany(() => Participante, (participante) => participante.formacion)
  participantes?: Participante[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
