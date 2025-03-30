interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dob: string;
  phone: string;
  country: string;
}

let users: User[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    dob: '1990-01-01',
    phone: '1234567890',
    country: 'USA',
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    password: 'password456',
    dob: '1992-02-02',
    phone: '0987654321',
    country: 'Canada',
  },
];

export const login = (email: string, password: string): User | null => {
  const user = users.find(u => u.email === email && u.password === password);
  return user || null;
};

export const resetPassword = (email: string): boolean => {
  const user = users.find(u => u.email === email);
  return !!user;
};

export const setNewPassword = (email: string, newPassword: string): boolean => {
  const user = users.find(u => u.email === email);
  if (user) {
    user.password = newPassword;
    return true;
  }
  return false;
};

export const register = (newUser: Omit<User, 'id'>): User => {
  const id = users.length + 1;
  const user = { id, ...newUser };
  users.push(user);
  return user;
};
