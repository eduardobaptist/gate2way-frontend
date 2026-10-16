import { MainWrapper } from "@/components/MainWrapper";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeftCircle, CheckCircleIcon, Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import api from "@/axios";
import { useState, useEffect } from "react";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RequiredFieldSpan } from "@/components/RequiredFieldSpan";
import { useAuth } from "@/contexts/AuthContext";

const rotaFormSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
});

export const RotasEdit = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();

  const { user } = useAuth();
  const empresa_id = user?.empresa_id;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm({
    resolver: zodResolver(rotaFormSchema),
    defaultValues: {
      nome: "",
      descricao: "",
    },
  });

  useEffect(() => {
    const fetchRota = async () => {
      try {
        const response = await api.get(`/rotas/${id}`);
        const rota = response.data;

        if (!rota) {
          toast({
            title: "Erro ao carregar rota",
            description: "Rota não encontrada",
            variant: "destructive",
          });
          navigate("/rotas");
          return;
        }

        form.reset({
          nome: rota.nome,
          descricao: rota.descricao,
        });
      } catch (error) {
        toast({
          title: "Erro ao carregar rota",
          description: "Não foi possível carregar os dados da rota",
          variant: "destructive",
        });
        navigate("/rotas");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRota();
  }, [id, navigate, toast, form]);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await api.put(`/rotas/${id}`, {
        ...data,
        empresa_id,
      });

      toast({
        title: "Rota atualizada com sucesso.",
        variant: "success",
      });

      navigate("/rotas");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Erro ao atualizar rota. Tente novamente.";

      toast({
        title: "Erro ao atualizar a rota",
        description: errorMessage,
        variant: "destructive",
      });

      if (error.response?.status === 403) {
        form.setError("root", {
          type: "manual",
          message:
            "Você não tem permissão para editar rotas de outras empresas.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = () => {
    form.handleSubmit(handleSubmit)();
  };

  return (
    <MainWrapper title="Editar rota" contentClassName="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              className="bg-[var(--azul-agregar)] text-white hover:text-white hover:bg-[var(--azul-agregar-hover)]"
              variant="outline"
              disabled={isSubmitting}
            >
              <ArrowLeftCircle className="mr-2" size="20" />
              Voltar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Tem certeza que deseja fechar?
              </AlertDialogTitle>
              <AlertDialogDescription>
                As alterações não salvas serão perdidas.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <Link to="/rotas">
                <AlertDialogAction className="w-full md:w-fit">
                  Continuar
                </AlertDialogAction>
              </Link>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button
          className="bg-green-700 text-white font-bold hover:text-white hover:bg-green-800"
          variant="outline"
          onClick={handleSave}
          disabled={isSubmitting}
        >
          <CheckCircleIcon className="mr-2" size="20" />
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex mt-5 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Carregando rota...
        </div>
      ) : (
        <div className="mt-5">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="w-full grid grid-cols-2 gap-4"
            >
              {form.formState.errors.root && (
                <div className="col-span-2 text-red-500 text-sm">
                  {form.formState.errors.root.message}
                </div>
              )}

              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem className="col-span-2 md:col-span-1">
                    <FormLabel>
                      Nome <RequiredFieldSpan />
                    </FormLabel>
                    <FormControl aria-required="true">
                      <Input type="text" disabled={isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem className="col-span-2 md:col-span-1">
                    <FormLabel>
                      Descrição <RequiredFieldSpan />
                    </FormLabel>
                    <FormControl aria-required="true">
                      <Textarea rows={4} disabled={isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      )}
    </MainWrapper>
  );
};
