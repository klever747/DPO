import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum TipoEvidencia {
  DOCUMENTO = 'documento',
  CAPTURA = 'captura',
  REGISTRO = 'registro',
  FIRMA = 'firma',
  OTRO = 'otro',
}

@Entity({ name: 'evidencias', schema: 'evidence' })
export class Evidencia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @Column({ name: 'modulo_origen' })
  moduloOrigen: string;

  @Column({ name: 'referencia_id', type: 'uuid', nullable: true })
  referenciaId?: string;

  @Column({ name: 'tipo_evidencia', type: 'enum', enum: TipoEvidencia, enumName: 'tipo_evidencia', default: TipoEvidencia.DOCUMENTO })
  tipoEvidencia: TipoEvidencia;

  @Column({ name: 'nombre_archivo' })
  nombreArchivo: string;

  @Column({ name: 'url_almacenamiento' })
  urlAlmacenamiento: string;

  @Column({ name: 'hash_integridad', nullable: true })
  hashIntegridad?: string;

  @Column({ name: 'subido_por', nullable: true })
  subidoPor?: string;

  @Column({ name: 'fecha_subida', type: 'timestamptz' })
  fechaSubida: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
