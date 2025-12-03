import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { storage } from "./storage";
import { validateCredentials, findUser } from "./authConfig";
import { Pool } from "@neondatabase/serverless";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    isAuthenticated?: boolean;
    courierName?: string;
    username?: string;
  }
}

export function setupSimpleAuth(app: Express) {
  const sessionSecret = process.env.SESSION_SECRET || "courier-delivery-secret-key";
  
  // Setup PostgreSQL session store for session persistence
  const PgSession = connectPgSimple(session);
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  const sessionStore = new PgSession({
    pool: pool as any,
    tableName: "sessions",
    createTableIfMissing: false, // Table already exists from schema
  });
  
  app.use(
    session({
      store: sessionStore,
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

      const validUser = validateCredentials(username, password);
      if (!validUser) {
        return res.status(401).json({ message: "Неверный логин или пароль" });
      }

      const { courierInfo } = validUser;

      // Single-device enforcement: Check for existing session and invalidate it
      const existingSession = await storage.getUserSession(courierInfo.id);
      if (existingSession) {
        // Destroy the old session from the database
        await storage.deleteSessionById(existingSession.sessionId);
        console.log(`Invalidated previous session for user ${courierInfo.id}`);
      }

      let user = await storage.getUser(courierInfo.id);
      if (!user) {
        user = await storage.upsertUser({
          id: courierInfo.id,
          email: `${username}@courier.local`,
          firstName: courierInfo.name,
          lastName: "",
        });
      }

      let courier = await storage.getCourierByUserId(courierInfo.id);
      if (!courier) {
        courier = await storage.createCourier({
          userId: courierInfo.id,
          name: courierInfo.name,
          isOnline: false,
        });
      }

      // Regenerate session to prevent session fixation attacks
      const regenerateSession = (): Promise<void> => {
        return new Promise((resolve, reject) => {
          req.session.regenerate((err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      };

      await regenerateSession();

      req.session.userId = courierInfo.id;
      req.session.isAuthenticated = true;
      req.session.courierName = courierInfo.name;
      req.session.username = username;

      // Get device info for tracking
      const deviceInfo = req.headers["user-agent"] || "unknown";
      const ipAddress = req.ip || req.socket.remoteAddress || "unknown";

      // Save session mapping for single-device enforcement (with new session ID)
      await storage.setUserSession(courierInfo.id, req.sessionID!, deviceInfo, ipAddress);

      res.json({ 
        success: true, 
        user: {
          id: courierInfo.id,
          name: courierInfo.name,
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Ошибка входа в систему" });
    }
  });

  app.post("/api/logout", async (req, res) => {
    try {
      const userId = req.session.userId;
      
      // Clear session mapping if exists
      if (userId) {
        await storage.deleteUserSession(userId);
      }
      
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Ошибка выхода из системы" });
        }
        res.json({ success: true });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Ошибка выхода из системы" });
    }
  });

  app.get("/api/auth/user", (req, res) => {
    if (!req.session.isAuthenticated || !req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    res.json({
      id: req.session.userId,
      name: req.session.courierName || "Курьер",
      email: `${req.session.username || "courier"}@courier.local`,
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.session.isAuthenticated || !req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Single-device enforcement: Check if this session is still the active one
  try {
    const activeSession = await storage.getUserSession(req.session.userId);
    if (activeSession && activeSession.sessionId !== req.sessionID) {
      // This session has been superseded by a login from another device
      req.session.destroy(() => {});
      return res.status(401).json({ 
        message: "Сессия завершена. Выполнен вход с другого устройства.",
        code: "SESSION_SUPERSEDED"
      });
    }
  } catch (error) {
    console.error("Session validation error:", error);
    // Continue if check fails - don't block user for database errors
  }
  
  (req as any).userId = req.session.userId;
  next();
};
