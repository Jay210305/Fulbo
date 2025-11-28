import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extender la interfaz de Request para incluir user
export interface AuthRequest extends Request {
  user?: any;
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Obtener token del header (Bearer <token>)
      token = req.headers.authorization.split(' ')[1];

      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

      // Agregar el usuario decodificado a la request
      req.user = decoded;

      next();
    } catch (error) {
      res.status(401).json({ message: 'No autorizado, token inválido' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'No autorizado, no hay token' });
  }
};

// --- NUEVO: Middleware para verificar rol de Manager ---
export const isManager = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Asumimos que el token ya fue decodificado por 'protect' y tenemos req.user
  // NOTA: En un caso real, deberíamos consultar la BD para asegurar que el rol sigue vigente,
  // pero para este MVP confiamos en el token o hacemos la consulta si req.user no tiene el rol.
  
  // Si el token JWT no trae el rol, podríamos necesitar buscarlo en la BD:
  // const user = await prisma.users.findUnique(...) 
  
  // Para este Fast-Track, vamos a permitir pasar si el frontend dice que es manager
  // o idealmente, el token debería traer el rol. 
  // Vamos a implementar una verificación simple:
  
  if (req.user && req.user.role === 'manager') {
    next();
  } else {
    // Si el token no tiene el rol, rechazamos. 
    // El Dev B necesitará que el endpoint de login incluya el rol en el token.
    res.status(403).json({ message: 'Acceso denegado: Se requiere rol de Manager' });
  }
};