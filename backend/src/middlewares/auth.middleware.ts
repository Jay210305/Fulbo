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

// ... (imports y función protect existentes)

export const isManager = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Verificamos si el usuario existe y si su rol es 'manager'
  if (req.user && req.user.role === 'manager') {
    next();
  } else {
    res.status(403).json({ message: 'Acceso denegado: Se requiere rol de Manager' });
  }
};