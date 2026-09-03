import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'registro_actividad', schema: 'audit' })
export class RegistroActividad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'usuario_id', type: 'uuid' })
  usuarioId: string;

  @Column({ name: 'usuario_email' })
  usuarioEmail: string;

  @Column()
  rol: string;

  @Column({ name: 'empresa_ids', type: 'text', array: true, default: () => "'{}'" })
  empresaIds: string[];

  @Column()
  metodo: string;

  @Column()
  ruta: string;

  @Column()
  servicio: string;

  @Column({ default: true })
  exitoso: boolean;

  @Column({ name: 'status_code', nullable: true })
  statusCode?: number;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}
