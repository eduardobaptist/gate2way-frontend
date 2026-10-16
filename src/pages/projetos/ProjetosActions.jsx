import { useState } from "react";
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
import {
  MoreHorizontal,
  Trash2,
  Edit2,
  Eye,
  Send,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import api from "@/axios";

export const ProjetosActions = ({ projeto, onRefresh }) => {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { user } = useAuth();
  const userTipo = user?.tipo;

  const handleView = (e) => {
    e.stopPropagation();
    navigate(`/projetos/${projeto.id}`);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/projetos/editar/${projeto.id}`);
  };

  const handlePublish = async (e) => {
    e.stopPropagation();
    try {
      await api.post("/ofertas", {
        projeto_id: projeto.id,
        data_inicio: projeto.data_inicio,
        data_fim: projeto.data_fim,
      });
      toast({ title: "Projeto criado com sucesso", variant: "success" });
      onRefresh?.();
    } catch (error) {
      toast({
        title: error.response?.data?.message || "Erro ao ofertar projeto",
        variant: "destructive",
      });
    } finally {
      setIsDropdownOpen(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    try {
      await api.delete(`/projetos/${projeto.id}`);
      toast({ title: "Projeto excluído com sucesso", variant: "success" });
      onRefresh?.();
    } catch (error) {
      toast({
        title: error.response?.data?.message || "Erro ao excluir projeto",
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
              onOpenChange={setIsDropdownOpen}
            >
          {/* UX Gate2Way: o tooltip usa o próprio botão; evita botões aninhados e preserva o teclado. */}
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger
                type="button"
                aria-label="Ações"
                title="Ações"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-6 w-6 text-gray-500 hover:text-gray-700" />
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent><p>Ações</p></TooltipContent>
          </Tooltip>
          <DropdownMenuContent
                align="end"
                className="w-48"
                onClick={(e) => e.stopPropagation()}
              >
                {["admin", "empresa"].includes(userTipo) &&
                projeto.status === "NÃO PÚBLICADO" ? (
                  <DropdownMenuItem
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={(e) => handlePublish(e)}
                  >
                    <Send className="h-4 w-4" />
                    <span>Publicar</span>
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem
                  onClick={(e) => handleView(e)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Eye className="h-4 w-4" />
                  <span>Ver detalhes</span>
                </DropdownMenuItem>
                {projeto.status === "NÃO PÚBLICADO" && ["admin", "empresa"].includes(userTipo) ? (
                  <DropdownMenuItem
                    onClick={handleEdit}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>Alterar</span>
                  </DropdownMenuItem>
                ) : null}
                {["admin", "empresa"].includes(userTipo) ? (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDeleteDialogOpen(true);
                      setIsDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Deletar</span>
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
        </DropdownMenu>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir “{projeto.nome}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todos os dados relacionados a
              este projeto serão permanentemente excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => handleDelete(e)}
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
