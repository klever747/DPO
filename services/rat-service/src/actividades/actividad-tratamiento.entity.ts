import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum EstadoActividad {
  BORRADOR = 'borrador',
  VIGENTE = 'vigente',
  OBSOLETO = 'obsoleto',
}

export enum RolOrganizacion {
  RESPONSABLE = 'responsable',
  ENCARGADO = 'encargado',
  CORRESPONSABLE = 'corresponsable',
}

export enum VolumenTratamiento {
  BAJO = 'bajo',
  MEDIO = 'medio',
  ALTO = 'alto',
}

@Entity({ name: 'actividades_tratamiento', schema: 'rat' })
export class ActividadTratamiento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @Column({ name: 'nombre_actividad' })
  nombreActividad: string;

  @Column()
  finalidad: string;

  @Column({ name: 'base_legal' })
  baseLegal: string;

  @Column({ name: 'categorias_datos', type: 'text', array: true, default: () => "'{}'" })
  categoriasDatos: string[];

  @Column({ name: 'categorias_titulares', type: 'text', array: true, default: () => "'{}'" })
  categoriasTitulares: string[];

  @Column({ type: 'text', array: true, default: () => "'{}'" })
  destinatarios: string[];

  @Column({ name: 'transferencias_internacionales', default: false })
  transferenciasInternacionales: boolean;

  @Column({ name: 'paises_destino', type: 'text', array: true, default: () => "'{}'" })
  paisesDestino: string[];

  @Column({ name: 'garantias_transferencia', nullable: true })
  garantiasTransferencia?: string;

  @Column({ name: 'plazo_conservacion', nullable: true })
  plazoConservacion?: string;

  @Column({ name: 'medidas_seguridad', type: 'text', nullable: true })
  medidasSeguridad?: string;

  @Column({ name: 'responsable_tratamiento', nullable: true })
  responsableTratamiento?: string;

  @Column({ name: 'encargado_tratamiento', nullable: true })
  encargadoTratamiento?: string;

  @Column({ name: 'fecha_evaluacion', type: 'date', nullable: true })
  fechaEvaluacion?: string;

  @Column({ type: 'enum', enum: EstadoActividad, enumName: 'estado_actividad', default: EstadoActividad.BORRADOR })
  estado: EstadoActividad;

  @Column({ name: 'rol_organizacion', type: 'enum', enum: RolOrganizacion, enumName: 'rol_organizacion', default: RolOrganizacion.RESPONSABLE })
  rolOrganizacion: RolOrganizacion;

  @Column({ name: 'persona_responsable', nullable: true })
  personaResponsable?: string;

  @Column({ name: 'departamento_propietario', nullable: true })
  departamentoPropietario?: string;

  @Column({ name: 'origen_datos', nullable: true })
  origenDatos?: string;

  @Column({ name: 'tratamiento_ocasional', default: false })
  tratamientoOcasional: boolean;

  @Column({ name: 'ambito_geografico', nullable: true })
  ambitoGeografico?: string;

  @Column({ name: 'volumen_tratamientos', type: 'enum', enum: VolumenTratamiento, enumName: 'volumen_tratamiento', default: VolumenTratamiento.BAJO })
  volumenTratamientos: VolumenTratamiento;

  @Column({ name: 'ejercicio_derechos', type: 'text', nullable: true })
  ejercicioDerechos?: string;

  @Column({ name: 'finalidad_cesion', nullable: true })
  finalidadCesion?: string;

  @Column({ name: 'sistema_informacion', nullable: true })
  sistemaInformacion?: string;

  @Column({ name: 'conservacion_papel', default: false })
  conservacionPapel: boolean;

  @Column({ name: 'almacenamiento_local', default: false })
  almacenamientoLocal: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
