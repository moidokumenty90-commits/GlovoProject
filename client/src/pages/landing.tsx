import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Clock, Lock, User } from "lucide-react";
import logoImage from "@assets/Без_названия_1764747745659.png";

export default function Landing() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!username || !password) {
      setError("Введите логин и пароль");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Ошибка входа");
      }

      window.location.href = "/";
    } catch (error: any) {
      setError(error.message || "Неверный логин или пароль");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logoImage} alt="Логотип" className="w-10 h-10" />
          <span className="font-bold text-lg">Доставка</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center space-y-4">
            <img src={logoImage} alt="Логотип" className="w-20 h-20 mx-auto" />
            <h1 className="text-2xl font-bold" data-testid="text-landing-title">
              Система курьерской доставки
            </h1>
            <p className="text-muted-foreground" data-testid="text-landing-subtitle">
              Войдите для доступа к системе
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Логин
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Введите логин"
                    data-testid="input-username"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Пароль
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Введите пароль"
                    data-testid="input-password"
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm" data-testid="text-login-error">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 text-base font-semibold"
                  data-testid="button-login"
                  disabled={isLoading}
                >
                  {isLoading ? "Вход..." : "Войти в систему"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid gap-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Отслеживание на карте</p>
                <p className="text-xs text-muted-foreground">
                  Все заказы в реальном времени
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Быстрое управление</p>
                <p className="text-xs text-muted-foreground">
                  Все действия в один клик
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-4 text-center text-sm text-muted-foreground border-t">
        Система доставки
      </footer>
    </div>
  );
}
