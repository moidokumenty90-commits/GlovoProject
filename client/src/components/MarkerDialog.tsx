import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapPin, Check, X } from "lucide-react";

interface MarkerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "restaurant" | "customer";
  lat?: number;
  lng?: number;
  onSave: (data: { name: string; address: string; lat: number; lng: number }) => void;
}

export function MarkerDialog({
  open,
  onOpenChange,
  type,
  lat,
  lng,
  onSave,
}: MarkerDialogProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (!open) {
      setName("");
      setAddress("");
    }
  }, [open]);

  const handleSave = () => {
    if (!name.trim() || lat === undefined || lng === undefined) return;

    onSave({
      name: name.trim(),
      address: address.trim(),
      lat,
      lng,
    });

    setName("");
    setAddress("");
    onOpenChange(false);
  };

  const title = type === "restaurant" ? "Добавить заведение" : "Добавить клиента";
  const placeholder = type === "restaurant" ? "Название заведения" : "Имя клиента";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className={`w-5 h-5 ${type === "restaurant" ? "text-green-600" : "text-gray-700"}`} />
            {title}
          </DialogTitle>
          <DialogDescription>
            Перетащите метку на карте в нужное место
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Название *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={placeholder}
              data-testid="input-marker-name"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Адрес</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="ул. Центральная, 1"
              data-testid="input-marker-address"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-marker"
          >
            <X className="w-4 h-4 mr-2" />
            Отмена
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!name.trim()}
            data-testid="button-save-marker"
          >
            <Check className="w-4 h-4 mr-2" />
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteMarkerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  markers: Array<{ id: string; name: string }>;
  onDelete: (id: string) => void;
}

export function DeleteMarkerDialog({
  open,
  onOpenChange,
  markers,
  onDelete,
}: DeleteMarkerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Удалить метку</DialogTitle>
          <DialogDescription>
            Выберите метку для удаления
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4 max-h-64 overflow-y-auto">
          {markers.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Нет доступных меток
            </p>
          ) : (
            markers.map((marker) => (
              <Button
                key={marker.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  onDelete(marker.id);
                  onOpenChange(false);
                }}
                data-testid={`button-delete-marker-${marker.id}`}
              >
                {marker.name}
              </Button>
            ))
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
