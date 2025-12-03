import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, Filter, Search, Package, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { OrderStatusBadge } from "@/components/StatusBadge";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Order } from "@shared/schema";

export default function History() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const [customerSearch, setCustomerSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders/history", statusFilter, customerSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "all") {
        params.set("status", statusFilter);
      }
      if (customerSearch) {
        params.set("customerName", customerSearch);
      }
      const response = await fetch(`/api/orders/history?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json();
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return await apiRequest("DELETE", `/api/orders/${orderId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders/active"] });
      toast({
        title: "Заказ удалён",
        description: "Заказ успешно удалён из истории",
      });
      setDeleteOrderId(null);
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить заказ",
        variant: "destructive",
      });
    },
  });

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDeleteClick = (orderId: string) => {
    setDeleteOrderId(orderId);
  };

  const confirmDelete = () => {
    if (deleteOrderId) {
      deleteOrderMutation.mutate(deleteOrderId);
    }
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
          <h1 className="text-xl font-bold flex-1">{t.history.title}</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            data-testid="button-toggle-filters"
          >
            <Filter className="w-5 h-5" />
          </Button>
        </div>

        {showFilters && (
          <div className="px-4 pb-4 space-y-3 border-t pt-3 bg-muted/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t.history.searchCustomer}
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="pl-10"
                data-testid="input-customer-search"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="select-status-filter">
                <SelectValue placeholder={t.status.allStatuses} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.status.allStatuses}</SelectItem>
                <SelectItem value="new">{t.status.new}</SelectItem>
                <SelectItem value="accepted">{t.status.accepted}</SelectItem>
                <SelectItem value="in_transit">{t.status.inTransit}</SelectItem>
                <SelectItem value="delivered">{t.status.delivered}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </header>

      <main className="p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">{t.history.noOrders}</h2>
            <p className="text-muted-foreground">
              {customerSearch || statusFilter !== "all"
                ? t.history.changeFilters
                : t.history.emptyHistory}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Card key={order.id} data-testid={`card-order-${order.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-lg" data-testid={`text-order-number-${order.id}`}>
                          #{order.orderNumber}
                        </span>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(order.createdAt || new Date())}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-lg text-primary">
                        {order.totalPrice.toFixed(2)} ₴
                      </p>
                      <button
                        onClick={() => handleDeleteClick(order.id)}
                        className="w-10 h-10 rounded-full border-2 border-red-200 flex items-center justify-center hover:bg-red-50 transition-colors"
                        data-testid={`button-delete-order-${order.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex gap-2">
                      <span className="text-muted-foreground shrink-0">Клиент:</span>
                      <span className="font-medium truncate">{order.customerName}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-muted-foreground shrink-0">Адрес:</span>
                      <span className="truncate">{order.customerAddress}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-muted-foreground shrink-0">Ресторан:</span>
                      <span className="truncate">{order.restaurantName}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteOrderId} onOpenChange={(open) => !open && setDeleteOrderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить заказ?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить этот заказ? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Отмена</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
              data-testid="button-confirm-delete"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
