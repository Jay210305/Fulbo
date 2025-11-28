import jwt, { SignOptions } from 'jsonwebtoken';

export const generateToken = (userId: string, email: string) => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET no está definido en las variables de entorno');
  }

  const signInOptions: SignOptions = {
    // SOLUCIÓN: Agregamos 'as any' aquí. 
    // Esto fuerza a TS a aceptar el string '7d' como válido para la librería.
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
  };

  return jwt.sign(
    { id: userId, email }, 
    secret, 
    signInOptions
  );
};