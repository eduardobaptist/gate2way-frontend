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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeftCircle, CheckCircleIcon, CalendarIcon } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

import api from "@/axios";
import { useState } from "react";
import { cn } from "@/lib/utils";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RequiredFieldSpan } from "@/components/RequiredFieldSpan";

const impulsoFormSchema = z
  .object({
    descricao: z.string().min(1, "Descrição é obrigatória"),
    valor: z.string(),
    data_inicio: z.date({
      invalid_type_error: "Formato de data inválido",
    }),
    data_fim: z.date({
      invalid_type_error: "Formato de data inválido",
    }),
  })
  .refine((data) => data.data_inicio < data.data_fim, {
    message: "A data de início deve ser anterior à data de término",
    path: ["data_inicio"],
  });

export const ImpulsosCreate = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(impulsoFormSchema),
    defaultValues: {
      descricao: "",
      valor: "",
      data_inicio: new Date(),
      data_fim: null,
    },
  });

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await api.post("/impulsos", {
        ...data, valor: parseFloat(data.valor.replace(/[^\d,]/g, "").replace(",", "."))
      });

      toast({
        title: "Impulso criado com sucesso.",
        variant: "success",
      });

      navigate("/impulsos");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Erro ao criar impulso. Tente novamente.";

      toast({
        title: "Erro ao criar o impulso",
        description: errorMessage,
        variant: "destructive",
      });

      // se for erro de permissão, dar feedback mais específico
      if (error.response?.status === 403) {
        form.setError("root", {
          type: "manual",
          message:
            "Você não tem permissão para criar impulsos para outras empresas.",
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
    <MainWrapper title="Novo impulso acadêmico" contentClassName="mx-auto max-w-4xl">
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
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <Link to="/impulsos">
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
              name="descricao"
              render={({ field }) => (
                <FormItem className="col-span-2 md:col-span-1">
                  <FormLabel>Descrição <RequiredFieldSpan /></FormLabel>
                  <FormControl aria-required="true">
                    <Input type="text" disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="valor"
              render={({ field }) => (
                <FormItem className="col-span-2 md:col-span-1">
                  <FormLabel>Valor (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      {...field}
                      disabled={isSubmitting}
                      placeholder="R$ 0,00"
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "");

                        if (digits.length === 0) {
                          field.onChange("");
                          return;
                        }

                        const numericValue = parseFloat(digits) / 100;
                        const formatted = numericValue.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                          minimumFractionDigits: 2
                        });

                        field.onChange(formatted);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="data_inicio"
              render={({ field }) => (
                <FormItem className="col-span-2 md:col-span-1 flex flex-col">
                  <FormLabel>Data de início <RequiredFieldSpan /></FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl aria-required="true">
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/y", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="data_fim"
              render={({ field }) => (
                <FormItem className="col-span-2 md:col-span-1 flex flex-col">
                  <FormLabel>Data de término <RequiredFieldSpan /></FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl aria-required="true">
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/y", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    </MainWrapper>
  );
};
