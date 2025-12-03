import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Truck, Clock } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Truck className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">Доставка</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="space-y-4">
            <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Truck className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold" data-testid="text-landing-title">
              Система курьерской доставки
            </h1>
            <p className="text-muted-foreground" data-testid="text-landing-subtitle">
              Быстрая и удобная доставка заказов
            </p>
          </div>

          <div className="grid gap-4">
            <Card className="text-left">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Отслеживание на карте</h3>
                  <p className="text-sm text-muted-foreground">
                    Видите все заказы и маршруты в реальном времени
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="text-left">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Быстрое управление</h3>
                  <p className="text-sm text-muted-foreground">
                    Все действия доступны в один клик
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <a href="/api/login" className="block w-full">
            <Button
              size="lg"
              className="w-full h-14 text-lg font-semibold rounded-xl"
              data-testid="button-login"
            >
              Войти в систему
            </Button>
          </a>
        </div>
      </main>

      <footer className="p-4 text-center text-sm text-muted-foreground border-t">
        Система доставки
      </footer>
    </div>
  );
}
