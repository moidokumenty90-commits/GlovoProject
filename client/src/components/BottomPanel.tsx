import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { ChevronUp, Plus, Camera, X, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BottomPanelProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export function BottomPanel({ isExpanded, onToggleExpand }: BottomPanelProps) {
  const [, setLocation] = useLocation();
  const [attachedPhotos, setAttachedPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddOrder = () => {
    setLocation("/add-order");
  };

  const handleAttachPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAttachedPhotos((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
    // Reset input
    e.target.value = "";
  };

  const removePhoto = (index: number) => {
    setAttachedPhotos((prev) => prev.filter((_, i) => i !== index));
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Заказы</h2>
            <button
              onClick={onToggleExpand}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
              data-testid="button-close-panel"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Photos Section */}
          {attachedPhotos.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Прикрепленные фото</h3>
              <div className="flex flex-wrap gap-3">
                {attachedPhotos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={photo}
                      alt={`Фото ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-xl border border-gray-200"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-md"
                      data-testid={`button-remove-photo-${index}`}
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Spacer */}
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

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
            data-testid="input-photo"
          />
        </div>
      )}
    </div>
  );
}
