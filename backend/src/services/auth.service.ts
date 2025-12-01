import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { generateToken } from '../utils/jwt'; // <--- 1. IMPORTAR ESTO

// Definimos una interfaz para los datos de entrada (lo que viene del controller)
interface RegisterUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  documentType?: string;
  documentNumber?: string;
  city?: string;
  district?: string;
  phoneNumber?: string;
}

// Interface para Social Login (Google/Facebook)
interface SocialLoginDto {
  email: string;
  firstName: string;
  lastName: string;
  provider: 'google' | 'facebook';
  providerId: string;
  photoUrl?: string;
}

export class AuthService {
  
  // --- MÉTODO EXISTENTE: REGISTRO ---
  static async registerUser(data: RegisterUserDto) {
    // 1. Verificar si el email ya existe
    const existingUser = await prisma.users.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // 2. Encriptar la contraseña [cite: 40]
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    // 3. Crear el usuario mapeando camelCase -> snake_case
    const newUser = await prisma.users.create({
      data: {
        email: data.email,
        password_hash: hashedPassword,
        first_name: data.firstName,
        last_name: data.lastName,
        document_type: data.documentType,
        document_number: data.documentNumber,
        city: data.city,
        district: data.district,
        phone_number: data.phoneNumber,
        role: 'player',
        auth_provider: 'email'
      },
    });

    // 4. Generar el Token inmediatamente (AUTO-LOGIN)
    const token = generateToken(newUser.user_id, newUser.email, newUser.role);

    // 5. Retornar usuario y token
    const { password_hash, ...userWithoutPassword } = newUser;
    
    return { 
      user: userWithoutPassword, 
      token // <--- Ahora devolvemos el token también aquí
    };
  }

  // --- NUEVO MÉTODO: LOGIN (AGREGAR ESTO) ---
  static async loginUser(email: string, passwordPlain: string) {
    // 1. Buscar usuario por email
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Credenciales inválidas (Usuario no encontrado)');
    }

    // 2. Verificar si tiene contraseña (caso Social Login)
    if (!user.password_hash) {
      throw new Error('Este usuario se registró con redes sociales, usa ese método.');
    }

    // 3. Comparar contraseña con el Hash [cite: 40]
    const isMatch = await bcrypt.compare(passwordPlain, user.password_hash);

    if (!isMatch) {
      throw new Error('Credenciales inválidas (Contraseña incorrecta)');
    }

    // 4. Generar Token JWT [cite: 39]
    const token = generateToken(user.user_id, user.email, user.role);

    // 5. Retornar usuario (sin pass) y token
    const { password_hash, ...userWithoutPassword } = user;
    
    return { user: userWithoutPassword, token };
  }

  // --- NUEVO MÉTODO: SOCIAL LOGIN (Google/Facebook) ---
  static async socialLogin(data: SocialLoginDto) {
    // 1. Buscar si el usuario ya existe por email O por auth_provider_id
    let user = await prisma.users.findFirst({
      where: {
        OR: [
          { email: data.email },
          { 
            auth_provider: data.provider,
            auth_provider_id: data.providerId 
          }
        ]
      }
    });

    if (user) {
      // Usuario existe - verificar si necesita actualizar auth_provider
      if (user.auth_provider === 'email' && !user.auth_provider_id) {
        // Usuario se registró con email, ahora vincula cuenta social
        user = await prisma.users.update({
          where: { user_id: user.user_id },
          data: {
            auth_provider: data.provider,
            auth_provider_id: data.providerId
          }
        });
      }
    } else {
      // Usuario no existe - crear nuevo usuario
      user = await prisma.users.create({
        data: {
          email: data.email,
          first_name: data.firstName,
          last_name: data.lastName,
          auth_provider: data.provider,
          auth_provider_id: data.providerId,
          role: 'player',
          // password_hash es null porque usa social login
        }
      });
    }

    // 2. Generar Token JWT
    const token = generateToken(user.user_id, user.email, user.role);

    // 3. Retornar usuario (sin pass) y token
    const { password_hash, ...userWithoutPassword } = user;
    
    return { user: userWithoutPassword, token };
  }
}