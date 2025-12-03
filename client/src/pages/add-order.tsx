import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import type { Courier } from "@shared/schema";

const orderItemSchema = z.object({
  name: z.string().min(1, "Введите название товара"),
  price: z.number().min(0, "Цена должна быть положительной"),
  quantity: z.number().min(1).default(1),
  modifiers: z.string().optional(),
});

const formSchema = z.object({
  restaurantName: z.string().min(1, "Введите название заведения"),
  restaurantAddress: z.string().min(1, "Введите адрес заведения"),
  restaurantCompany: z.string().optional(),
  restaurantComment: z.string().optional(),
  customerAddress: z.string().min(1, "Введите адрес доставки"),
  houseNumber: z.string().optional(),
  apartment: z.string().optional(),
  floor: z.string().optional(),
  buildingInfo: z.string().optional(),
  customerName: z.string().min(1, "Введите имя клиента"),
  customerId: z.string().optional(),
  customerPhone: z.string().optional(),
  orderNumber: z.string().min(1, "Введите номер заказа"),
  totalPrice: z.number().min(0, "Введите сумму заказа"),
  paymentMethod: z.enum(["cash", "card"]),
  needsChange: z.boolean().default(false),
  comment: z.string().optional(),
  pickupGroupId: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  modifiers?: string;
}

export default function AddOrder() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [items, setItems] = useState<OrderItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");

  // Get courier to assign order
  const { data: courier } = useQuery<Courier>({
    queryKey: ["/api/courier"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      restaurantName: "",
      restaurantAddress: "",
      restaurantCompany: "",
      restaurantComment: "",
      customerAddress: "",
      houseNumber: "",
      apartment: "",
      floor: "",
      buildingInfo: "",
      customerName: "",
      customerId: "",
      customerPhone: "",
      orderNumber: "",
      totalPrice: 0,
      paymentMethod: "cash",
      needsChange: false,
      comment: "",
      pickupGroupId: "",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Use default coordinates (Dnipro city center area)
      const defaultCoords = {
        restaurantLat: 48.4647 + (Math.random() - 0.5) * 0.02,
        restaurantLng: 35.0462 + (Math.random() - 0.5) * 0.02,
        customerLat: 48.4647 + (Math.random() - 0.5) * 0.02,
        customerLng: 35.0462 + (Math.random() - 0.5) * 0.02,
      };
      
      return await apiRequest("POST", "/api/orders", {
        ...data,
        ...defaultCoords,
        items,
        courierId: courier?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/active"] });
      toast({
        title: "Заказ создан",
        description: "Новый заказ успешно добавлен",
      });
      navigate("/");
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать заказ",
        variant: "destructive",
      });
    },
  });

  const handleAddItem = () => {
    if (newItemName && newItemPrice) {
      const price = parseFloat(newItemPrice);
      if (!isNaN(price) && price >= 0) {
        setItems([...items, { name: newItemName, price, quantity: 1 }]);
        setNewItemName("");
        setNewItemPrice("");
        
        // Update total
        const newTotal = [...items, { price }].reduce((sum, item) => sum + item.price, 0);
        form.setValue("totalPrice", newTotal);
      }
    }
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    
    // Update total
    const newTotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    form.setValue("totalPrice", newTotal);
  };

  const onSubmit = (data: FormData) => {
    createOrderMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background" data-testid="add-order-screen">
      {/* Header */}
      <header className="sticky top-0 bg-background border-b z-10">
        <div className="flex items-center justify-between p-4">
          <Link href="/">
            <button className="p-2 -ml-2" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <h1 className="text-xl font-bold">Добавить заказ</h1>
          <div className="w-9" />
        </div>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-6">
          {/* Restaurant Section */}
          <section className="space-y-4">
            <FormField
              control={form.control}
              name="restaurantName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название заведения</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Введите название заведения"
                      {...field}
                      data-testid="input-restaurant-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="restaurantAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Адрес заведения</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Введите адрес заведения"
                      {...field}
                      data-testid="input-restaurant-address"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="restaurantCompany"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Компания</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Например: VARUS, McDonald's"
                      {...field}
                      data-testid="input-restaurant-company"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="restaurantComment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Инструкция для курьера</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Отдельный вход, касса и т.д."
                      {...field}
                      data-testid="input-restaurant-comment"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pickupGroupId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID группы заказов</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Для группировки нескольких заказов"
                      {...field}
                      data-testid="input-pickup-group-id"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          {/* Delivery Address Section */}
          <section className="space-y-4 pt-4 border-t">
            <FormField
              control={form.control}
              name="customerAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Адрес доставки (улица, номер)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Введите адрес доставки"
                      {...field}
                      data-testid="input-customer-address"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="houseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Номер дома</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Номер дома"
                      {...field}
                      data-testid="input-house-number"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apartment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Квартира</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Квартира (опционально)"
                      {...field}
                      data-testid="input-apartment"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="floor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Этаж</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Этаж (опционально)"
                      {...field}
                      data-testid="input-floor"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="buildingInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Информация о здании</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Пологовий стаціонар, бізнес-центр"
                      {...field}
                      data-testid="input-building-info"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          {/* Customer Section */}
          <section className="space-y-4 pt-4 border-t">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Имя клиента</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Введите имя клиента"
                      {...field}
                      data-testid="input-customer-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID клиента</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Введите ID клиента"
                      {...field}
                      data-testid="input-customer-id"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Телефон клиента</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+380..."
                      {...field}
                      data-testid="input-customer-phone"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          {/* Order Details Section */}
          <section className="space-y-4 pt-4 border-t">
            <FormField
              control={form.control}
              name="orderNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Номер заказа</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Введите номер заказа"
                      {...field}
                      data-testid="input-order-number"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Order Items */}
            <div className="space-y-3">
              <Label>Товары в заказе</Label>
              
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.price.toFixed(2)} ₴</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <div className="flex gap-2">
                <Input
                  placeholder="Название товара"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="flex-1"
                  data-testid="input-item-name"
                />
                <Input
                  placeholder="Цена"
                  type="number"
                  step="0.01"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  className="w-24"
                  data-testid="input-item-price"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddItem}
                  data-testid="button-add-item"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <FormField
              control={form.control}
              name="totalPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Общая сумма</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      data-testid="input-total-price"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Способ оплаты</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-payment-method">
                        <SelectValue placeholder="Выберите способ оплаты" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Наличные</SelectItem>
                      <SelectItem value="card">Безнал</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="needsChange"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="checkbox-needs-change"
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Клиент запросил сдачу</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Комментарий</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Дополнительные комментарии к заказу"
                      {...field}
                      data-testid="input-comment"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-14 rounded-full text-base font-semibold text-white"
            style={{ backgroundColor: "#00A082" }}
            disabled={createOrderMutation.isPending}
            data-testid="button-create-order"
          >
            {createOrderMutation.isPending ? "Создание..." : "Создать заказ"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
