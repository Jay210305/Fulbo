import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';

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

export class AuthService {
  
  static async registerUser(data: RegisterUserDto) {
    // 1. Verificar si el email ya existe
    const existingUser = await prisma.users.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // 2. Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    // 3. Crear el usuario mapeando camelCase -> snake_case
    const newUser = await prisma.users.create({
      data: {
        email: data.email,
        password_hash: hashedPassword,
        first_name: data.firstName,       // Mapeo clave
        last_name: data.lastName,         // Mapeo clave
        document_type: data.documentType,
        document_number: data.documentNumber,
        city: data.city,
        district: data.district,
        phone_number: data.phoneNumber,
        role: 'player',
        auth_provider: 'email'
      },
    });

    // 4. Retornar sin password
    const { password_hash, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }
}