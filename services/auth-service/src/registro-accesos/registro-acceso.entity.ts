import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'registro_accesos', schema: 'auth' })
export class RegistroAcceso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'usuario_id', type: 'uuid', nullable: true })
  usuarioId?: string | null;

  @Column()
  email: string;

  @Column()
  exitoso: boolean;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date;
}
