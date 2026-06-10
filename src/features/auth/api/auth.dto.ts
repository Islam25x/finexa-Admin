export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
  expiresAt?: string | null;
  expiresIn?: number | null;
}

export interface LogoutResponseDto {
  message: string;
}
