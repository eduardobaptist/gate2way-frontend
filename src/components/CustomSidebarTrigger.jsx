import { useSidebar } from "@/components/ui/sidebar";
import { PanelLeft } from "lucide-react";

export const CustomSidebarTrigger = () => {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      className="flex shrink-0 items-center justify-center w-10 h-10 mr-4 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
      aria-label="Alternar menu lateral"
    >
      <PanelLeft className="w-5 h-5" />
    </button>
  );
};
