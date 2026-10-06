"use client";
import { setManualReduce, useManualReduce, useSistemaReduce } from "@/lib/motion";

export function MotionToggle() {
  const manual = useManualReduce();
  const sistema = useSistemaReduce();
  const activo = manual || sistema;
  return (
    <div>
      <button
        type="button"
        role="switch"
        aria-checked={activo}
        disabled={sistema}
        onClick={() => setManualReduce(!manual)}
        className="inline-flex items-center gap-3 rounded-full py-1 font-bold text-crema disabled:opacity-70"
      >
        <span className={`relative h-7 w-12 rounded-full transition-colors ${activo ? "bg-dorado" : "bg-crema/25"}`} aria-hidden="true">
          <span className={`absolute top-1 left-1 size-5 rounded-full bg-crema shadow transition-transform ${activo ? "translate-x-5" : ""}`} />
        </span>
        Reducir animaciones
      </button>
      {sistema && <p className="mt-1 text-sm text-crema/70">Activado por la configuración de tu dispositivo.</p>}
    </div>
  );
}
