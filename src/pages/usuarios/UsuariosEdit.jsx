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
import InputMask from "react-input-mask";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftCircle,
  CheckCircleIcon,
  Loader2,
  EyeOff,
  Eye,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

import { toast } from "@/hooks/use-toast";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/axios";
import { RequiredFieldSpan } from "@/components/RequiredFieldSpan";

const usuarioFormSchema = z.object({
  nome: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(255, "Nome não deve exceder 255 caracteres"),
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .max(255, "E-mail não deve exceder 255 caracteres")
    .email("E-mail inválido"),
  // Na edicao, senha vazia preserva a senha existente.
  senha: z
    .string()
    .max(20, "Senha não deve exceder os 20 caracteres")
    .optional(),
  endereco: z.string().optional(),
  telefone: z
    .string()
    .optional()
    .refine((value) => {
      if (!value) return true;
      const digits = value.replace(/\D/g, "");
      if (digits.length === 0) return true;
      if (digits.length === 11) return true;
      if (digits.length === 10 && digits.charAt(2) !== "9") return true;
      return false;
    }, "Telefone inválido. Use 10 dígitos para fixo (sem 9) ou 11 para celular"),
});

export const UsuariosEdit = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [usuarioState, setUsuarioState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getPhoneMask = (value) => {
    // Registros com telefone null usam a mesma mascara de um campo vazio.
    const digits = (value || "").replace(/\D/g, "");
    if (
      digits.length === 11 ||
      (digits.length >= 3 && digits.charAt(2) === "9")
    ) {
      return "(99) 99999-9999"; // celular
    }
    return "(99) 9999-9999"; // telefone fixo
  };

  const [phoneMask, setPhoneMask] = useState("(99) 9999-9999");
  const { id } = useParams();
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(usuarioFormSchema),
    defaultValues: {
      nome: "",
      email: "",
      senha: "",
      endereco: "",
      telefone: "",
    },
  });

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const response = await api.get(`/usuarios/${id}`);
        const usuario = response.data;

        if (!usuario) {
          toast({
            title: "Erro ao carregar usuário",
            description: "Usuário não encontrado",
            variant: "destructive",
          });
          navigate("/usuários");
          return;
        }

        setUsuarioState(usuario);

        setPhoneMask(getPhoneMask(usuario.telefone));

        form.reset({
          nome: usuario.nome,
          email: usuario.email,
          telefone: usuario.telefone ?? "",
          senha: "",
        });
      } catch (error) {
        toast({
          title: "Erro ao carregar usuário",
          description: "Não foi possível carregar os dados do usuário",
          variant: "destructive",
        });
        navigate("/usuarios");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsuario();
  }, [id, navigate, toast, form]);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Omitir senha vazia tambem preserva o hash na API que ainda nao trata esse caso.
      const { senha, ...dadosUsuario } = data;
      const response = await api.put(`/usuarios/${id}`, {
        ...dadosUsuario,
        ...(senha ? { senha } : {}),
        telefone: data.telefone?.replace(/\D/g, ""),
        // A API retorna os vinculos em Responsavels, e nao na raiz do usuario.
        ict_id: usuarioState?.Responsavels?.[0]?.ict_id,
        empresa_id: usuarioState?.Responsavels?.[0]?.empresa_id,
        tipo: usuarioState.tipo,
      });

      toast({
        title: "Usuário atualizdo com sucesso.",
        variant: "success",
      });

      navigate("/usuarios");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Erro ao atualizar usuário. Tente novamente.";

      toast({
        title: errorMessage,
        variant: "destructive",
      });

      if (error.response?.status === 403) {
        form.setError("root", {
          type: "manual",
          message: "Você não tem permissão para atualizar usuários.",
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
    <MainWrapper title="Editar usuário" contentClassName="mx-auto max-w-4xl">
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
              <Link to="/usuarios">
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
            Carregando usuário...
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="w-full grid grid-cols-2 gap-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => {
                  return (
                    <FormItem className="col-span-2 md:col-span-1">
                      <FormLabel>
                        E-mail <RequiredFieldSpan />
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
                name="senha"
                render={({ field }) => (
                  <FormItem className="relative col-span-2 md:col-span-1">
                    <FormLabel>
                      Senha
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          {...field}
                          className="pr-10"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <button
                        type="button"
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                        aria-pressed={showPassword}
                        disabled={isSubmitting}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <FormDescription>Deixe em branco para manter a senha atual. Uma nova senha pode ter até 20 caracteres.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                name="telefone"
                render={({ field }) => (
                  <FormItem className="col-span-2 md:col-span-1">
                    <FormLabel>Telefone/celular</FormLabel>
                    <FormControl>
                      <InputMask
                        mask={phoneMask}
                        value={field.value}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "");
                          const newMask = getPhoneMask(digits);

                          if (newMask !== phoneMask) {
                            setPhoneMask(newMask);
                          }

                          field.onChange(e.target.value);
                        }}
                        disabled={isSubmitting}
                      >
                        {(inputProps) => (
                          <Input
                            {...inputProps}
                            type="tel"
                            placeholder="(99) 9999-9999"
                          />
                        )}
                      </InputMask>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )}
      </div>
    </MainWrapper>
  );
};
