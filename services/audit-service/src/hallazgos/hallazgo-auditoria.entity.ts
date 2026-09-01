import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Auditoria } from '../auditorias/auditoria.entity';

export enum SeveridadHallazgo {
  BAJA = 'baja',
  MEDIA = 'media',
  ALTA = 'alta',
  CRITICA = 'critica',
}

export enum EstadoHallazgo {
  ABIERTO = 'abierto',
  EN_REMEDIACION = 'en_remediacion',
  CERRADO = 'cerrado',
}

@Entity({ name: 'hallazgos_auditoria', schema: 'audit' })
export class HallazgoAuditoria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'auditoria_id', type: 'uuid' })
  auditoriaId: string;

  @ManyToOne(() => Auditoria, (auditoria) => auditoria.hallazgos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'auditoria_id' })
  auditoria?: Auditoria;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'enum', enum: SeveridadHallazgo, enumName: 'severidad_hallazgo', default: SeveridadHallazgo.MEDIA })
  severidad: SeveridadHallazgo;

  @Column({ type: 'text', nullable: true })
  recomendacion?: string;

  @Column({ nullable: true })
  responsable?: string;

  @Column({ type: 'enum', enum: EstadoHallazgo, enumName: 'estado_hallazgo', default: EstadoHallazgo.ABIERTO })
  estado: EstadoHallazgo;

  @Column({ name: 'fecha_limite_remediacion', type: 'date', nullable: true })
  fechaLimiteRemediacion?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
