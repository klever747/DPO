import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum EstadoActividad {
  BORRADOR = 'borrador',
  VIGENTE = 'vigente',
  OBSOLETO = 'obsoleto',
}

@Entity({ name: 'actividades_tratamiento', schema: 'rat' })
export class ActividadTratamiento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @Column({ name: 'nombre_actividad' })
  nombreActividad: string;

  @Column()
  finalidad: string;

  @Column({ name: 'base_legal' })
  baseLegal: string;

  @Column({ name: 'categorias_datos', type: 'text', array: true, default: () => "'{}'" })
  categoriasDatos: string[];

  @Column({ name: 'categorias_titulares', type: 'text', array: true, default: () => "'{}'" })
  categoriasTitulares: string[];

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  destinatarios: string[];

  @Column({ name: 'transferencias_internacionales', default: false })
  transferenciasInternacionales: boolean;

  @Column({ name: 'paises_destino', type: 'text', array: true, default: () => "'{}'" })
  paisesDestino: string[];

  @Column({ name: 'garantias_transferencia', nullable: true })
  garantiasTransferencia?: string;

  @Column({ name: 'plazo_conservacion', nullable: true })
  plazoConservacion?: string;

  @Column({ name: 'medidas_seguridad', type: 'text', nullable: true })
  medidasSeguridad?: string;

  @Column({ name: 'responsable_tratamiento', nullable: true })
  responsableTratamiento?: string;

  @Column({ name: 'encargado_tratamiento', nullable: true })
  encargadoTratamiento?: string;

  @Column({ name: 'fecha_evaluacion', type: 'date', nullable: true })
  fechaEvaluacion?: string;

  @Column({ type: 'enum', enum: EstadoActividad, enumName: 'estado_actividad', default: EstadoActividad.BORRADOR })
  estado: EstadoActividad;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
