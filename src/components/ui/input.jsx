import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type, icon, ...props }, ref) => {
  return (
    <div className="relative flex min-w-0 items-center">
      {icon}
      <input
        type={type}
        className={cn(
          "flex h-10 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          // UX Gate2Way: mantém o seletor nativo e o nome do arquivo, com apresentação consistente.
          type === "file" && "h-auto cursor-pointer p-2 file:mr-3 file:rounded-md file:bg-[var(--azul-agregar)] file:px-3 file:py-2 file:text-white",
          className
        )}
        ref={ref}
        {...props}
      />
    </div>
  );
});
Input.displayName = "Input";

export { Input };
