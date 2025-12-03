import { useState } from "react";
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
  const [latitude, setLatitude] = useState(lat?.toString() || "");
  const [longitude, setLongitude] = useState(lng?.toString() || "");

  const handleSave = () => {
    if (!name.trim() || !latitude || !longitude) return;

    onSave({
      name: name.trim(),
      address: address.trim(),
      lat: parseFloat(latitude),
      lng: parseFloat(longitude),
    });

    // Reset form
    setName("");
    setAddress("");
    setLatitude("");
    setLongitude("");
    onOpenChange(false);
  };

  const title = type === "restaurant" ? "Добавить метку заведения" : "Добавить метку клиента";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Нажмите на карту, чтобы выбрать местоположение, или введите координаты вручную.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Название</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === "restaurant" ? "McDonald's" : "Имя клиента"}
              data-testid="input-marker-name"
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lat">Широта</Label>
              <Input
                id="lat"
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="48.4647"
                data-testid="input-marker-lat"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lng">Долгота</Label>
              <Input
                id="lng"
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="35.0462"
                data-testid="input-marker-lng"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || !latitude || !longitude}>
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
