import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum UnidadPlazo {
  DIAS = 'dias',
  MESES = 'meses',
  ANIOS = 'anios',
}

export enum AccionVencimiento {
  ELIMINACION = 'eliminacion',
  ANONIMIZACION = 'anonimizacion',
  ARCHIVADO = 'archivado',
}

@Entity({ name: 'politicas_retencion', schema: 'retention' })
export class PoliticaRetencion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @Column({ name: 'categoria_datos' })
  categoriaDatos: string;

  @Column({ name: 'base_legal_retencion', nullable: true })
  baseLegalRetencion?: string;

  @Column({ name: 'plazo_valor', type: 'int' })
  plazoValor: number;

  @Column({ name: 'plazo_unidad', type: 'enum', enum: UnidadPlazo, enumName: 'unidad_plazo', default: UnidadPlazo.ANIOS })
  plazoUnidad: UnidadPlazo;

  @Column({ name: 'criterio_inicio_computo', nullable: true })
  criterioInicioComputo?: string;

  @Column({ name: 'accion_al_vencer', type: 'enum', enum: AccionVencimiento, enumName: 'accion_vencimiento', default: AccionVencimiento.ELIMINACION })
  accionAlVencer: AccionVencimiento;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
