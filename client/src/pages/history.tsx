import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, Filter, Search, Package, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { OrderStatusBadge } from "@/components/StatusBadge";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Order } from "@shared/schema";

export default function History() {
  const { t } = useLanguage();
  const [statusFilter, setStatusFilter] = useState("all");
  const [customerSearch, setCustomerSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  
  const [editForm, setEditForm] = useState({
    orderNumber: "",
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    houseNumber: "",
    apartment: "",
    floor: "",
    restaurantName: "",
    restaurantAddress: "",
    totalPrice: "",
    paymentMethod: "card",
    comment: "",
    status: "new",
  });

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
      setDeleteOrderId(null);
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<Order> }) => {
      return await apiRequest("PATCH", `/api/orders/${data.id}`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders/active"] });
      setEditOrder(null);
    },
  });

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("uk-UA", {
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

  const handleEditClick = (order: Order) => {
    setEditForm({
      orderNumber: order.orderNumber || "",
      customerName: order.customerName || "",
      customerPhone: order.customerPhone || "",
      customerAddress: order.customerAddress || "",
      houseNumber: order.houseNumber || "",
      apartment: order.apartment || "",
      floor: order.floor || "",
      restaurantName: order.restaurantName || "",
      restaurantAddress: order.restaurantAddress || "",
      totalPrice: order.totalPrice?.toString() || "0",
      paymentMethod: order.paymentMethod || "card",
      comment: order.comment || "",
      status: order.status || "new",
    });
    setEditOrder(order);
  };

  const confirmDelete = () => {
    if (deleteOrderId) {
      deleteOrderMutation.mutate(deleteOrderId);
    }
  };

  const handleSaveEdit = () => {
    if (!editOrder) return;
    
    updateOrderMutation.mutate({
      id: editOrder.id,
      updates: {
        orderNumber: editForm.orderNumber,
        customerName: editForm.customerName,
        customerPhone: editForm.customerPhone,
        customerAddress: editForm.customerAddress,
        houseNumber: editForm.houseNumber,
        apartment: editForm.apartment,
        floor: editForm.floor,
        restaurantName: editForm.restaurantName,
        restaurantAddress: editForm.restaurantAddress,
        totalPrice: parseFloat(editForm.totalPrice) || 0,
        paymentMethod: editForm.paymentMethod,
        comment: editForm.comment,
        status: editForm.status,
      },
    });
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
                        onClick={() => handleEditClick(order)}
                        className="w-10 h-10 rounded-full border-2 border-blue-200 flex items-center justify-center hover:bg-blue-50 transition-colors"
                        data-testid={`button-edit-order-${order.id}`}
                      >
                        <Pencil className="w-4 h-4 text-blue-500" />
                      </button>
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
                      <span className="text-muted-foreground shrink-0">Клієнт:</span>
                      <span className="font-medium truncate">{order.customerName}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-muted-foreground shrink-0">Адреса:</span>
                      <span className="truncate">{order.customerAddress}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-muted-foreground shrink-0">Магазин:</span>
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
            <AlertDialogTitle>Видалити замовлення?</AlertDialogTitle>
            <AlertDialogDescription>
              Ви впевнені, що хочете видалити це замовлення? Цю дію неможливо скасувати.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Скасувати</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
              data-testid="button-confirm-delete"
            >
              Видалити
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Order Dialog */}
      <Dialog open={!!editOrder} onOpenChange={(open) => !open && setEditOrder(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редагувати замовлення</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="orderNumber">Номер замовлення</Label>
              <Input
                id="orderNumber"
                value={editForm.orderNumber}
                onChange={(e) => setEditForm({ ...editForm, orderNumber: e.target.value })}
                data-testid="input-edit-order-number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Статус</Label>
              <Select 
                value={editForm.status} 
                onValueChange={(val) => setEditForm({ ...editForm, status: val })}
              >
                <SelectTrigger data-testid="select-edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Новий</SelectItem>
                  <SelectItem value="accepted">Прийнято</SelectItem>
                  <SelectItem value="in_transit">В дорозі</SelectItem>
                  <SelectItem value="delivered">Доставлено</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerName">Ім'я клієнта</Label>
              <Input
                id="customerName"
                value={editForm.customerName}
                onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                data-testid="input-edit-customer-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone">Телефон</Label>
              <Input
                id="customerPhone"
                value={editForm.customerPhone}
                onChange={(e) => setEditForm({ ...editForm, customerPhone: e.target.value })}
                data-testid="input-edit-customer-phone"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerAddress">Адреса доставки</Label>
              <Input
                id="customerAddress"
                value={editForm.customerAddress}
                onChange={(e) => setEditForm({ ...editForm, customerAddress: e.target.value })}
                data-testid="input-edit-customer-address"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-2">
                <Label htmlFor="houseNumber">Будинок</Label>
                <Input
                  id="houseNumber"
                  value={editForm.houseNumber}
                  onChange={(e) => setEditForm({ ...editForm, houseNumber: e.target.value })}
                  data-testid="input-edit-house-number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apartment">Квартира</Label>
                <Input
                  id="apartment"
                  value={editForm.apartment}
                  onChange={(e) => setEditForm({ ...editForm, apartment: e.target.value })}
                  data-testid="input-edit-apartment"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="floor">Поверх</Label>
                <Input
                  id="floor"
                  value={editForm.floor}
                  onChange={(e) => setEditForm({ ...editForm, floor: e.target.value })}
                  data-testid="input-edit-floor"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="restaurantName">Назва магазину</Label>
              <Input
                id="restaurantName"
                value={editForm.restaurantName}
                onChange={(e) => setEditForm({ ...editForm, restaurantName: e.target.value })}
                data-testid="input-edit-restaurant-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="restaurantAddress">Адреса магазину</Label>
              <Input
                id="restaurantAddress"
                value={editForm.restaurantAddress}
                onChange={(e) => setEditForm({ ...editForm, restaurantAddress: e.target.value })}
                data-testid="input-edit-restaurant-address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalPrice">Сума (₴)</Label>
              <Input
                id="totalPrice"
                type="number"
                step="0.01"
                value={editForm.totalPrice}
                onChange={(e) => setEditForm({ ...editForm, totalPrice: e.target.value })}
                data-testid="input-edit-total-price"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Спосіб оплати</Label>
              <Select 
                value={editForm.paymentMethod} 
                onValueChange={(val) => setEditForm({ ...editForm, paymentMethod: val })}
              >
                <SelectTrigger data-testid="select-edit-payment-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Сплачено онлайн</SelectItem>
                  <SelectItem value="cash">Готівка</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Коментар</Label>
              <Input
                id="comment"
                value={editForm.comment}
                onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                data-testid="input-edit-comment"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setEditOrder(null)}
              data-testid="button-cancel-edit"
            >
              Скасувати
            </Button>
            <Button 
              onClick={handleSaveEdit}
              disabled={updateOrderMutation.isPending}
              className="bg-black hover:bg-gray-800"
              data-testid="button-save-edit"
            >
              {updateOrderMutation.isPending ? "Збереження..." : "Зберегти"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
