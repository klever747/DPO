import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MadurezDominio } from './madurez-dominio.entity';

@Entity({ name: 'evaluaciones_madurez', schema: 'maturity' })
export class EvaluacionMadurez {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @Column({ name: 'fecha_evaluacion', type: 'date' })
  fechaEvaluacion: string;

  @Column({ default: 'DPO-5-Niveles' })
  modelo: string;

  @Column({ nullable: true })
  evaluador?: string;

  @Column({ name: 'nivel_global', type: 'numeric', precision: 3, scale: 1, nullable: true })
  nivelGlobal?: number;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @OneToMany(() => MadurezDominio, (dominio) => dominio.evaluacion, { cascade: true, eager: true })
  dominios: MadurezDominio[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
