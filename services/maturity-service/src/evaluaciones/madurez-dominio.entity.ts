import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EvaluacionMadurez } from './evaluacion-madurez.entity';

@Entity({ name: 'madurez_dominios', schema: 'maturity' })
export class MadurezDominio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'evaluacion_id', type: 'uuid' })
  evaluacionId: string;

  @ManyToOne(() => EvaluacionMadurez, (evaluacion) => evaluacion.dominios, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'evaluacion_id' })
  evaluacion?: EvaluacionMadurez;

  @Column()
  dominio: string;

  @Column({ type: 'smallint' })
  nivel: number;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;
}
