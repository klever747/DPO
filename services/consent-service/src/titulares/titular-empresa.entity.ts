import { Entity, PrimaryColumn } from 'typeorm';

/** Tabla puente titular <-> empresa (referencia lógica, sin FK entre esquemas). */
@Entity({ name: 'titular_empresas', schema: 'consent' })
export class TitularEmpresa {
  @PrimaryColumn({ name: 'titular_id', type: 'uuid' })
  titularId: string;

  @PrimaryColumn({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;
}
