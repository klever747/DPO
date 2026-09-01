import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum TipoPlantilla {
  ENCARGADO_TRATAMIENTO = 'encargado_tratamiento',
  CONFIDENCIALIDAD = 'confidencialidad',
  TRANSFERENCIA_INTERNACIONAL = 'transferencia_internacional',
  CLAUSULAS_ARCO = 'clausulas_arco',
  OTRO = 'otro',
}

@Entity({ name: 'plantillas_contrato', schema: 'contracts' })
export class PlantillaContrato {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @Column()
  nombre: string;

  @Column({ type: 'enum', enum: TipoPlantilla, enumName: 'tipo_plantilla' })
  tipo: TipoPlantilla;

  @Column({ default: '1.0' })
  version: string;

  @Column({ default: 'es' })
  idioma: string;

  @Column({ name: 'contenido_url', nullable: true })
  contenidoUrl?: string;

  @Column({ default: true })
  vigente: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
