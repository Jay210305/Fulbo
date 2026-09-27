export interface SerializedUser {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  phone_verified: boolean;
  role: string;
}

export function serializeUser(user: {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  phoneVerified: boolean;
  role: string;
}): SerializedUser {
  return {
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    phone_number: user.phoneNumber,
    phone_verified: user.phoneVerified,
    role: user.role,
  };
}
