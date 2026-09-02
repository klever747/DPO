import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
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

  /**
   * Un usuario puede pertenecer a varias empresas (relación muchos-a-muchos,
   * tabla puente auth.usuario_empresas). super_admin no necesita ninguna
   * asignación: tiene acceso implícito a todas.
   */
  @ManyToMany(() => Empresa)
  @JoinTable({
    name: 'usuario_empresas',
    joinColumn: { name: 'usuario_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'empresa_id', referencedColumnName: 'id' },
  })
  empresas: Empresa[];

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

  /** Claves de módulo (ver @dpo/common MODULE_CATALOG) que el usuario puede ver/usar. */
  @Column({ name: 'modulos_permitidos', type: 'text', array: true, default: () => "'{}'" })
  modulosPermitidos: string[];

  @Column({ default: true })
  activo: boolean;

  @Column({ name: 'ultimo_acceso', type: 'timestamptz', nullable: true })
  ultimoAcceso?: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
