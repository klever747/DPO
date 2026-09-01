import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Empresa } from '../empresas/empresa.entity';

export enum RolUsuario {
  SUPER_ADMIN = 'super_admin',
  ADMIN_EMPRESA = 'admin_empresa',
  DPO = 'dpo',
  GESTOR = 'gestor',
  AUDITOR = 'auditor',
  EMPLEADO = 'empleado',
}

@Entity({ name: 'usuarios', schema: 'auth' })
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'empresa_id', type: 'uuid', nullable: true })
  empresaId?: string | null;

  @ManyToOne(() => Empresa, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'empresa_id' })
  empresa?: Empresa;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  apellidos?: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'enum', enum: RolUsuario, enumName: 'rol_usuario', default: RolUsuario.EMPLEADO })
  rol: RolUsuario;

  @Column({ default: true })
  activo: boolean;

  @Column({ name: 'ultimo_acceso', type: 'timestamptz', nullable: true })
  ultimoAcceso?: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
