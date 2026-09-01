import { JwtModuleOptions } from '@nestjs/jwt';

export function buildJwtModuleOptions(): JwtModuleOptions {
  return {
    global: true,
    secret: process.env.JWT_SECRET || 'change_me_super_secret',
    signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '8h' },
  };
}
