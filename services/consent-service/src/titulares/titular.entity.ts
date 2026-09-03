import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'titulares', schema: 'consent' })
export class Titular {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ name: 'documento_identidad', nullable: true })
  documentoIdentidad?: string;

  @Column({ nullable: true })
  telefono?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
