import { CustomSidebarTrigger } from "./CustomSidebarTrigger";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export const MainWrapper = ({ title, children, contentClassName }) => {
  return (
    <section className="min-w-0 w-full">
      <div className="px-5 mt-3">
        <div className="flex items-center">
          <CustomSidebarTrigger />
          <h1 className="min-w-0 break-words text-2xl sm:text-3xl font-bold tracking-tighter">{title}</h1>
        </div>
      </div>
      <Separator className="mt-3 mb-10" />
      <div className="px-5 mb-10">
        {/* UX Gate2Way: formulários limitam a largura; tabelas e canvas usam o espaço disponível. */}
        <div className={cn("mt-5", contentClassName)}>{children}</div>
      </div>
    </section>
  );
};
