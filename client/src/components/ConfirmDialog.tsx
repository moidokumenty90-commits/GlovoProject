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

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: "default" | "destructive";
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Подтвердить",
  cancelLabel = "Отменить",
  onConfirm,
  onCancel,
  variant = "default",
}: ConfirmDialogProps) {
  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm rounded-2xl p-6">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-bold" data-testid="dialog-title">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground" data-testid="dialog-description">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-3 mt-6">
          <AlertDialogAction
            onClick={handleConfirm}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold ${
              variant === "destructive"
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-black hover:bg-gray-900 text-white"
            }`}
            data-testid="button-dialog-confirm"
          >
            {confirmLabel}
          </AlertDialogAction>
          <AlertDialogCancel
            onClick={handleCancel}
            className="flex-1 px-6 py-3 rounded-xl font-semibold bg-gray-200 hover:bg-gray-300 text-gray-800 border-0"
            data-testid="button-dialog-cancel"
          >
            {cancelLabel}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface DeliveryConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderNumber: string;
  onConfirm: () => void;
}

export function DeliveryConfirmDialog({
  open,
  onOpenChange,
  orderNumber,
  onConfirm,
}: DeliveryConfirmDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Подтверждение доставки"
      description={`Вы подтверждаете доставку заказа ${orderNumber}?`}
      confirmLabel="Подтвердить доставку"
      cancelLabel="Отменить"
      onConfirm={onConfirm}
    />
  );
}
