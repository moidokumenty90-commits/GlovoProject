import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, MapPin, User, Trash2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import type { Courier, Marker } from "@shared/schema";
import type { Language } from "@/lib/i18n/translations";

export default function Settings() {
  const { language, setLanguage, t, languageNames } = useLanguage();
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  // Fetch courier data
  const { data: courier, isLoading } = useQuery<Courier>({
    queryKey: ["/api/courier"],
  });

  // Fetch markers
  const { data: markers = [] } = useQuery<Marker[]>({
    queryKey: ["/api/markers"],
  });

  // Update courier mutation
  const updateCourierMutation = useMutation({
    mutationFn: async (data: Partial<Courier>) => {
      return await apiRequest("PATCH", "/api/courier", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courier"] });
      setEditingName(false);
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("PATCH", "/api/courier/status", {
        isOnline: !courier?.isOnline,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courier"] });
    },
  });

  // Delete marker mutation
  const deleteMarkerMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/markers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/markers"] });
    },
  });

  const handleSaveName = () => {
    if (newName.trim()) {
      updateCourierMutation.mutate({ name: newName.trim() });
    }
  };

  const restaurantMarkers = markers.filter((m) => m.type === "restaurant");
  const customerMarkers = markers.filter((m) => m.type === "customer");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="settings-screen">
      {/* Header */}
      <header className="sticky top-0 bg-background border-b z-10">
        <div className="flex items-center justify-between p-4">
          <Link href="/">
            <button className="p-2 -ml-2" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <h1 className="text-xl font-bold">{t.settings.title}</h1>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Courier Name Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between py-4 border-b">
            <Label className="text-base">Поменять имя курьера</Label>
            <div className="flex items-center gap-2">
              {editingName ? (
                <>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Введите имя"
                    className="w-32"
                    data-testid="input-courier-name"
                  />
                  <Button size="sm" onClick={handleSaveName} data-testid="button-save-name">
                    Сохранить
                  </Button>
                </>
              ) : (
                <>
                  <span className="text-muted-foreground" data-testid="text-courier-name">
                    {courier?.name || "Курьер"}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNewName(courier?.name || "");
                      setEditingName(true);
                    }}
                    data-testid="button-edit-name"
                  >
                    Изменить имя
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Status Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between py-4 border-b">
            <Label className="text-base">{t.status.online}/{t.status.offline}</Label>
            <Button
              variant={courier?.isOnline ? "default" : "outline"}
              onClick={() => toggleStatusMutation.mutate()}
              className={courier?.isOnline ? "bg-green-500 hover:bg-green-600" : ""}
              data-testid="button-toggle-status"
            >
              {courier?.isOnline ? t.status.online : t.status.offline}
            </Button>
          </div>
        </section>

        {/* Language Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between py-4 border-b">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-muted-foreground" />
              <Label className="text-base">{t.settings.language}</Label>
            </div>
            <Select
              value={language}
              onValueChange={(value) => setLanguage(value as Language)}
            >
              <SelectTrigger className="w-36" data-testid="select-language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ru">{languageNames.ru}</SelectItem>
                <SelectItem value="uk">{languageNames.uk}</SelectItem>
                <SelectItem value="en">{languageNames.en}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Restaurant Markers Section */}
        <section className="space-y-4">
          <div className="py-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base">Управление метками на карте</Label>
            </div>
            
            {restaurantMarkers.length > 0 ? (
              <div className="space-y-2">
                {restaurantMarkers.map((marker) => (
                  <div
                    key={marker.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{marker.name}</p>
                        {marker.address && (
                          <p className="text-sm text-muted-foreground">{marker.address}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteMarkerMutation.mutate(marker.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      data-testid={`button-delete-restaurant-${marker.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Нет сохранённых меток заведений</p>
            )}

            <div className="flex gap-2 mt-4">
              <Link href="/">
                <Button variant="outline" size="sm" className="text-green-600">
                  + Добавить метку заведения
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Customer Markers Section */}
        <section className="space-y-4">
          <div className="py-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base">Метка клиента</Label>
            </div>
            
            {customerMarkers.length > 0 ? (
              <div className="space-y-2">
                {customerMarkers.map((marker) => (
                  <div
                    key={marker.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{marker.name}</p>
                        {marker.address && (
                          <p className="text-sm text-muted-foreground">{marker.address}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteMarkerMutation.mutate(marker.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      data-testid={`button-delete-customer-${marker.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Нет сохранённых меток клиентов</p>
            )}

            <div className="flex gap-2 mt-4">
              <Link href="/">
                <Button variant="outline" size="sm" className="text-green-600">
                  + Добавить метку клиента
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Logout */}
        <section className="pt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.location.href = "/api/logout"}
            data-testid="button-logout"
          >
            {t.auth.logout}
          </Button>
        </section>
      </main>
    </div>
  );
}
