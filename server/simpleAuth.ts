import type { Express, RequestHandler } from "express";
import session from "express-session";
import { storage } from "./storage";
import { AUTH_CREDENTIALS, COURIER_INFO } from "./authConfig";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    isAuthenticated?: boolean;
  }
}

export function setupSimpleAuth(app: Express) {
  const sessionSecret = process.env.SESSION_SECRET || "courier-delivery-secret-key";
  
  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      },
    })
  );

  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Введите логин и пароль" });
      }

      if (username !== AUTH_CREDENTIALS.username || password !== AUTH_CREDENTIALS.password) {
        return res.status(401).json({ message: "Неверный логин или пароль" });
      }

      let user = await storage.getUser(COURIER_INFO.id);
      if (!user) {
        user = await storage.upsertUser({
          id: COURIER_INFO.id,
          email: `${username}@courier.local`,
          firstName: COURIER_INFO.name,
          lastName: "",
        });
      }

      let courier = await storage.getCourierByUserId(COURIER_INFO.id);
      if (!courier) {
        courier = await storage.createCourier({
          userId: COURIER_INFO.id,
          name: COURIER_INFO.name,
          isOnline: false,
        });
      }

      req.session.userId = COURIER_INFO.id;
      req.session.isAuthenticated = true;

      res.json({ 
        success: true, 
        user: {
          id: COURIER_INFO.id,
          name: COURIER_INFO.name,
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Ошибка входа в систему" });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Ошибка выхода из системы" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (!req.session.isAuthenticated || !req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    res.json({
      id: req.session.userId,
      name: COURIER_INFO.name,
      email: `${AUTH_CREDENTIALS.username}@courier.local`,
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.session.isAuthenticated || !req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  (req as any).userId = req.session.userId;
  next();
};
