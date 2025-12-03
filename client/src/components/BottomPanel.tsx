import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { ChevronUp, Plus, Camera, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BottomPanelProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export function BottomPanel({ isExpanded, onToggleExpand }: BottomPanelProps) {
  const [, setLocation] = useLocation();
  const [attachedPhoto, setAttachedPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastTapRef = useRef<number>(0);

  const handleAddOrder = () => {
    setLocation("/add-order");
  };

  const handleAttachPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleConfirmOrder = () => {
    // TODO: Submit photo order
    setAttachedPhoto(null);
    onToggleExpand();
  };

  const handleRemovePhoto = () => {
    setAttachedPhoto(null);
  };

  // Double tap handler for mobile
  const handlePhotoTap = () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;
    
    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      // Double tap detected
      handleRemovePhoto();
    }
    lastTapRef.current = now;
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-30 transition-all duration-300 ease-out",
        isExpanded ? "h-[85vh]" : "h-20"
      )}
      data-testid="bottom-panel"
    >
      {/* Drag Handle */}
      <button
        onClick={onToggleExpand}
        className="w-full py-3 flex items-center justify-center cursor-pointer"
        data-testid="button-toggle-bottom-panel"
      >
        <div className="w-10 h-1 bg-gray-300 rounded-full" />
      </button>

      {/* Collapsed State - Small preview */}
      {!isExpanded && (
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">Нет активных заказов</span>
            <ChevronUp className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      )}

      {/* Expanded State */}
      {isExpanded && (
        <div className="flex flex-col h-[calc(85vh-50px)] px-5 pb-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Заказы</h2>
            <button
              onClick={onToggleExpand}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
              data-testid="button-close-panel"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Photo attached - full screen view */}
          {attachedPhoto ? (
            <>
              {/* Full photo display - double tap to remove */}
              <div className="flex-1 relative mb-4">
                <img
                  src={attachedPhoto}
                  alt="Прикрепленное фото"
                  className="w-full h-full object-contain rounded-2xl cursor-pointer"
                  onClick={handlePhotoTap}
                  onDoubleClick={handleRemovePhoto}
                  data-testid="attached-photo"
                />
              </div>

              {/* Confirm Button */}
              <Button
                onClick={handleConfirmOrder}
                className="w-full h-14 rounded-full text-base font-semibold text-white shadow-lg"
                style={{ backgroundColor: "#00A082" }}
                data-testid="button-confirm-order"
              >
                <Check className="w-5 h-5 mr-2" />
                Подтвердить заказ
              </Button>
            </>
          ) : (
            <>
              {/* Empty state - spacer */}
              <div className="flex-1" />

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleAddOrder}
                  className="w-full h-14 rounded-full text-base font-semibold text-white shadow-lg"
                  style={{ backgroundColor: "#00A082" }}
                  data-testid="button-add-order"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Добавить заказ
                </Button>

                <Button
                  onClick={handleAttachPhoto}
                  variant="outline"
                  className="w-full h-14 rounded-full text-base font-semibold border-2 border-gray-300"
                  data-testid="button-attach-photo"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Прикрепить фото
                </Button>
              </div>
            </>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
            data-testid="input-photo"
          />
        </div>
      )}
    </div>
  );
}
