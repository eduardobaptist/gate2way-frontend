import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MainWrapper } from "@/components/MainWrapper";
import { Link, useNavigate } from "react-router-dom";
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
import {
  Check,
  ChevronsUpDown,
  ArrowLeftCircle,
  CheckCircleIcon,
  Loader2,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { toast } from "@/hooks/use-toast";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/axios";
import { RequiredFieldSpan } from "@/components/RequiredFieldSpan";

const programaFormSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  rota_id: z.number().min(1, "Selecione uma rota"),
});

export const ProgramasEdit = () => {
  const [rotas, setRotas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const empresa_id = user?.empresa_id;

  const form = useForm({
    resolver: zodResolver(programaFormSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      rota_id: 0,
    },
  });

  useEffect(() => {
    const fetchPrograma = async () => {
      try {
        const response = await api.get(`/programas/${id}`);
        const programa = response.data;

        if (!programa) {
          toast({
            title: "Erro ao carregar programa",
            description: "Programa não encontrada",
            variant: "destructive",
          });
          navigate("/programas");
          return;
        }

        form.reset({
          nome: programa.nome,
          descricao: programa.descricao,
          rota_id: programa.Rota.id,
        });
      } catch (error) {
        toast({
          title: "Erro ao carregar programa",
          description: "Não foi possível carregar os dados do programa",
          variant: "destructive",
        });
        navigate("/programas");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRotas();
    fetchPrograma();
  }, [id, navigate, toast, form]);

  const fetchRotas = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/rotas");
      setRotas(
        response.data.map((rota) => ({
          value: rota.id,
          label: rota.nome,
        }))
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Erro ao carregar rotas.";
      toast({
        title: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [open, setOpen] = useState(false);

  const handleRotas = () => {
    setOpen(!open);
    if (!open && rotas.length === 0) {
      fetchRotas();
    }
  };

  const handleSave = () => {
    form.handleSubmit(handleSubmit)();
  };

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await api.put(`/programas/${id}`, {
        ...data,
        empresa_id,
      });

      toast({
        title: "Programa alterado com sucesso.",
        variant: "success",
      });

      navigate("/programas");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Erro ao alterar programa. Tente novamente.";

      toast({
        title: errorMessage,
        variant: "destructive",
      });

      if (error.response?.status === 403) {
        form.setError("root", {
          type: "manual",
          message:
            "Você não tem permissão para alterar programas de outras empresas.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainWrapper title="Editar programa" contentClassName="mx-auto max-w-4xl">
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
                Os dados inseridos serão perdidos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>
                Cancelar
              </AlertDialogCancel>
              <Link to="/programas">
                <AlertDialogAction
                  className="w-full md:w-fit"
                  disabled={isSubmitting}
                >
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

      <div className="mt-5">
        {isLoading ? (
          <div className="flex mt-5 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Carregando rota...
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="w-full grid grid-cols-2 gap-4"
            >
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => {
                  return (
                    <FormItem className="col-span-2 md:col-span-1">
                      <FormLabel>
                        Nome <RequiredFieldSpan />
                      </FormLabel>
                      <FormControl aria-required="true">
                        <Input type="text" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="rota_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Rota do programa <RequiredFieldSpan />
                    </FormLabel>
                    <Popover open={open} onOpenChange={handleRotas}>
                      <PopoverTrigger asChild>
                        <FormControl><Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="w-full justify-between"
                          disabled={isSubmitting}
                        >
                          {field.value
                            ? rotas.find((prog) => prog.value === field.value)
                                ?.label
                            : "Selecione"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button></FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] max-w-[calc(100vw-2rem)] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Buscar rota..."
                            disabled={isSubmitting}
                          />
                          {isLoading ? (
                            <div className="flex my-3 items-center justify-center">
                              <Loader2 className="h-6 w-6 animate-spin mr-2" />
                              Carregando rotas...
                            </div>
                          ) : (
                            <CommandList>
                              <CommandEmpty>
                                Nenhuma rota encontrada.
                              </CommandEmpty>
                              <CommandGroup>
                                {rotas.map((prog) => (
                                  <CommandItem
                                    key={prog.value}
                                    onSelect={() => {
                                      field.onChange(prog.value);
                                      setOpen(false);
                                    }}
                                    data-selected={
                                      field.value === prog.value
                                        ? "true"
                                        : "false"
                                    }
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value === prog.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {prog.label}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          )}
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => {
                  return (
                    <FormItem className="col-span-2">
                      <FormLabel>
                        Descrição <RequiredFieldSpan />
                      </FormLabel>
                      <FormControl aria-required="true">
                        <Textarea rows={4} {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </form>
          </Form>
        )}
      </div>
    </MainWrapper>
  );
};
