export interface UserCredentials {
  username: string;
  password: string;
  courierInfo: {
    name: string;
    id: string;
  };
}

export const USERS: UserCredentials[] = [
  {
    username: "courier",
    password: "glovo123",
    courierInfo: {
      name: "Курьер",
      id: "courier-1",
    },
  },
  {
    username: "user1",
    password: "pass1234",
    courierInfo: {
      name: "Алексей",
      id: "courier-2",
    },
  },
  {
    username: "user2",
    password: "pass5678",
    courierInfo: {
      name: "Марина",
      id: "courier-3",
    },
  },
  {
    username: "user3",
    password: "pass9012",
    courierInfo: {
      name: "Дмитрий",
      id: "courier-4",
    },
  },
  {
    username: "user4",
    password: "pass3456",
    courierInfo: {
      name: "Ольга",
      id: "courier-5",
    },
  },
];

export function findUser(username: string): UserCredentials | undefined {
  return USERS.find((u) => u.username === username);
}

export function validateCredentials(username: string, password: string): UserCredentials | null {
  const user = findUser(username);
  if (user && user.password === password) {
    return user;
  }
  return null;
}

export const AUTH_CREDENTIALS = {
  username: "courier",
  password: "glovo123",
};

export const COURIER_INFO = {
  name: "Курьер",
  id: "courier-1",
};
