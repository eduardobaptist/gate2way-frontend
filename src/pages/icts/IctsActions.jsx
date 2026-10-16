import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { MoreHorizontal, Trash2, Edit2, Eye, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import api from "@/axios";

export const IctsActions = ({ ict, onRefresh }) => {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleView = () => {
    navigate(`/icts/${ict.id}`);
  };

  const handleEdit = () => {
    navigate(`/icts/editar/${ict.id}`);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/icts/${ict.id}`);
      toast({
        title: "ICT excluída com sucesso",
        variant: "success",
      });
      onRefresh?.();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Erro ao excluir ICT";
      toast({
        title: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setIsDropdownOpen(false);
    }
  };

  return (
    <TooltipProvider delayDuration={100}>
      <DropdownMenu
            open={isDropdownOpen}
            onOpenChange={(open) => {
              setIsDropdownOpen(open);
            }}
          >
          {/* UX Gate2Way: o tooltip usa o próprio botão; evita botões aninhados e preserva o teclado. */}
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger
                type="button"
                aria-label="Ações"
                title="Ações"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <MoreHorizontal className="h-6 w-6 text-gray-500 hover:text-gray-700" />
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent><p>Ações</p></TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={handleView}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Eye className="h-4 w-4" />
                <span>Ver detalhes</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleEdit}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Edit2 className="h-4 w-4" />
                <span>Alterar</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  setIsDeleteDialogOpen(true);
                  setIsDropdownOpen(false);
                }}
                className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                <span>Deletar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir “{ict.nome}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todos os dados relacionados a
              esta ICT serão permanentemente excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
};
