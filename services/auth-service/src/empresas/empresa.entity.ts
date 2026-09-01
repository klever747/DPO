import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'empresas', schema: 'auth' })
export class Empresa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column({ nullable: true, unique: true })
  nif?: string;

  @Column({ nullable: true })
  sector?: string;

  @Column({ nullable: true })
  direccion?: string;

  @Column({ nullable: true })
  pais?: string;

  @Column({ nullable: true })
  tamano?: string;

  @Column({ name: 'representante_legal', nullable: true })
  representanteLegal?: string;

  @Column({ name: 'dpo_nombre', nullable: true })
  dpoNombre?: string;

  @Column({ name: 'dpo_email', nullable: true })
  dpoEmail?: string;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
