export interface UserProfile {
  address: string;
  idProof: string;
  avatarUrl: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: 'citizen' | 'admin' | 'officer';
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role?: 'citizen' | 'admin' | 'officer';
}

export interface SignupData {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  role?: 'citizen' | 'admin' | 'officer';
}