export interface UserCredentials {
  username: string;
  password: string;
  courierInfo: {
    name: string;
    id: string;
  };
}

export function getUsers(): UserCredentials[] {
  const users: UserCredentials[] = [
    {
      username: "courier",
      password: "glovo123",
      courierInfo: {
        name: "Курьер",
        id: "courier-1",
      },
    },
  ];

  if (process.env.USER1_USERNAME && process.env.USER1_PASSWORD) {
    users.push({
      username: process.env.USER1_USERNAME,
      password: process.env.USER1_PASSWORD,
      courierInfo: {
        name: "Курьер 1",
        id: "courier-2",
      },
    });
  }

  if (process.env.USER2_USERNAME && process.env.USER2_PASSWORD) {
    users.push({
      username: process.env.USER2_USERNAME,
      password: process.env.USER2_PASSWORD,
      courierInfo: {
        name: "Курьер 2",
        id: "courier-3",
      },
    });
  }

  if (process.env.USER3_USERNAME && process.env.USER3_PASSWORD) {
    users.push({
      username: process.env.USER3_USERNAME,
      password: process.env.USER3_PASSWORD,
      courierInfo: {
        name: "Курьер 3",
        id: "courier-4",
      },
    });
  }

  if (process.env.USER4_USERNAME && process.env.USER4_PASSWORD) {
    users.push({
      username: process.env.USER4_USERNAME,
      password: process.env.USER4_PASSWORD,
      courierInfo: {
        name: "Курьер 4",
        id: "courier-5",
      },
    });
  }

  return users;
}

export function findUser(username: string): UserCredentials | undefined {
  return getUsers().find((u) => u.username === username);
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
