import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { PlantillaContrato } from '../plantillas/plantilla-contrato.entity';

export enum EstadoContrato {
  VIGENTE = 'vigente',
  VENCIDO = 'vencido',
  RESCINDIDO = 'rescindido',
}

@Entity({ name: 'contratos_asignados', schema: 'contracts' })
export class ContratoAsignado {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'plantilla_id', type: 'uuid' })
  plantillaId: string;

  @ManyToOne(() => PlantillaContrato)
  @JoinColumn({ name: 'plantilla_id' })
  plantilla?: PlantillaContrato;

  @Column({ name: 'tercero_nombre' })
  terceroNombre: string;

  @Column({ name: 'tercero_nif', nullable: true })
  terceroNif?: string;

  @Column({ name: 'fecha_firma', type: 'date', nullable: true })
  fechaFirma?: string;

  @Column({ name: 'fecha_vencimiento', type: 'date', nullable: true })
  fechaVencimiento?: string;

  @Column({ type: 'enum', enum: EstadoContrato, enumName: 'estado_contrato', default: EstadoContrato.VIGENTE })
  estado: EstadoContrato;

  @Column({ name: 'archivo_url', nullable: true })
  archivoUrl?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
