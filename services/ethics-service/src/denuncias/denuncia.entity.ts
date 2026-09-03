import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum CategoriaDenuncia {
  FRAUDE = 'fraude',
  ACOSO = 'acoso',
  CORRUPCION = 'corrupcion',
  PROTECCION_DATOS = 'proteccion_datos',
  DISCRIMINACION = 'discriminacion',
  OTRO = 'otro',
}

export enum EstadoDenuncia {
  RECIBIDA = 'recibida',
  EN_INVESTIGACION = 'en_investigacion',
  RESUELTA = 'resuelta',
  ARCHIVADA = 'archivada',
}

@Entity({ name: 'denuncias_canal_etico', schema: 'ethics' })
export class Denuncia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @Column({ name: 'codigo_seguimiento', unique: true })
  codigoSeguimiento: string;

  @Column({ type: 'enum', enum: CategoriaDenuncia, enumName: 'categoria_denuncia' })
  categoria: CategoriaDenuncia;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ name: 'denunciante_anonimo', default: true })
  denuncianteAnonimo: boolean;

  @Column({ name: 'denunciante_contacto', nullable: true })
  denuncianteContacto?: string;

  @Column({ type: 'enum', enum: EstadoDenuncia, enumName: 'estado_denuncia', default: EstadoDenuncia.RECIBIDA })
  estado: EstadoDenuncia;

  @Column({ name: 'fecha_recepcion', type: 'timestamptz' })
  fechaRecepcion: Date;

  @Column({ name: 'fecha_cierre', type: 'timestamptz', nullable: true })
  fechaCierre?: Date;

  @Column({ type: 'text', nullable: true })
  resolucion?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
