import { useState } from "react";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const OrganizationLogo = ({ src, name, icon: Icon = Building2, className }) => {
  const [failedSrc, setFailedSrc] = useState(null);
  const imageSrc = typeof src === "string" ? src.trim() : "";

  // UX Gate2Way: ausência ou falha da imagem mostra um ícone, mantendo o tamanho do logo.
  // Uma URL diferente pode carregar normalmente mesmo após falha da imagem anterior.
  return (
    <span className={cn("inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100 text-slate-600", className)}>
      {imageSrc && failedSrc !== imageSrc ? (
        <img src={imageSrc} alt={name ? `Logo de ${name}` : "Logo"} className="h-full w-full object-contain" onError={() => setFailedSrc(imageSrc)} />
      ) : (
        <Icon className="h-6 w-6" aria-hidden="true" />
      )}
    </span>
  );
};
