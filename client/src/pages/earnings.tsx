import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, TrendingUp, Package, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Stats {
  totalOrders: number;
  deliveredOrders: number;
  totalEarnings: number;
}

interface StatsResponse {
  daily: Stats | null;
  weekly: Stats | null;
  monthly: Stats | null;
}

export default function Earnings() {
  const { t } = useLanguage();
  const { data: stats, isLoading } = useQuery<StatsResponse>({
    queryKey: ["/api/orders/stats"],
  });

  const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color = "text-primary",
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: any;
    color?: string;
  }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-full bg-primary/10 ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const PeriodStats = ({ data, periodLabel }: { data: Stats | null; periodLabel: string }) => {
    if (!data) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          {t.earnings.noData} {periodLabel.toLowerCase()}
        </div>
      );
    }

    const completionRate = data.totalOrders > 0
      ? Math.round((data.deliveredOrders / data.totalOrders) * 100)
      : 0;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            title={t.earnings.totalEarnings}
            value={`${data.totalEarnings.toFixed(2)} ₴`}
            icon={DollarSign}
            color="text-green-600"
          />
          <StatCard
            title={t.earnings.deliveredOrders}
            value={data.deliveredOrders}
            subtitle={`${data.totalOrders} ${t.earnings.totalOrders.toLowerCase()}`}
            icon={Package}
            color="text-blue-600"
          />
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t.earnings.completionRate}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
              <span className="font-bold text-lg">{completionRate}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t.earnings.details}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">{t.earnings.totalOrders}</span>
              <span className="font-semibold">{data.totalOrders}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">{t.earnings.deliveredOrders}</span>
              <span className="font-semibold text-green-600">{data.deliveredOrders}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">{t.earnings.inProgress}</span>
              <span className="font-semibold text-yellow-600">
                {data.totalOrders - data.deliveredOrders}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">{t.earnings.averageCheck}</span>
              <span className="font-semibold">
                {data.deliveredOrders > 0
                  ? `${(data.totalEarnings / data.deliveredOrders).toFixed(2)} ₴`
                  : "0 ₴"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center gap-4 p-4">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold flex-1">{t.earnings.title}</h1>
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
      </header>

      <main className="p-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <Tabs defaultValue="day" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="day" data-testid="tab-daily">
                {t.earnings.today}
              </TabsTrigger>
              <TabsTrigger value="week" data-testid="tab-weekly">
                {t.earnings.week}
              </TabsTrigger>
              <TabsTrigger value="month" data-testid="tab-monthly">
                {t.earnings.month}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="day">
              <PeriodStats data={stats?.daily || null} periodLabel={t.earnings.today} />
            </TabsContent>

            <TabsContent value="week">
              <PeriodStats data={stats?.weekly || null} periodLabel={t.earnings.week} />
            </TabsContent>

            <TabsContent value="month">
              <PeriodStats data={stats?.monthly || null} periodLabel={t.earnings.month} />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
