import { useEffect, useState } from "react";
import { MainWrapper } from "@/components/MainWrapper";
import { Link, useNavigate } from "react-router-dom";
import InputMask from "react-input-mask";
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
import { Button } from "@/components/ui/button";
import {
  Check,
  ChevronsUpDown,
  ArrowLeftCircle,
  CheckCircleIcon,
  Loader2,
  Eye,
  EyeOff,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const getPhoneMask = (value) => {
  const digits = value.replace(/\D/g, "");
  if (
    digits.length === 11 ||
    (digits.length >= 3 && digits.charAt(2) === "9")
  ) {
    return "(99) 99999-9999"; // celular
  }
  return "(99) 9999-9999"; // telefone fixo
};

const usuarioFormSchema = z
  .object({
    nome: z
      .string()
      .min(1, "Nome é obrigatório")
      .max(255, "Nome não deve exceder 255 caracteres"),
    email: z
      .string()
      .min(1, "Email é obrigatório")
      .max(255, "Email não deve exceder 255 caracteres")
      .email("Email inválido"),
    senha: z
      .string()
      .min(1, "Insira a senha do usuário")
      .max(20, "Senha não deve exceder os 20 caracteres"),
    tipo: z.string().min(1, "Selecione o tipo de usuário"),
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
    empresa_id: z.number().nullable(),
    ict_id: z.number().nullable(),
  })
  .refine(
    (data) => {
      if (data.tipo === "ict" && !data.ict_id) {
        return false;
      }
      return true;
    },
    {
      message: "O ICT é obrigatório quando o tipo de usuário é ICT",
      path: ["ict_id"],
    }
  )
  .refine(
    (data) => {
      if (data.tipo === "empresa" && !data.empresa_id) {
        return false;
      }
      return true;
    },
    {
      message: "A empresa é obrigatória quando o tipo de usuário é empresa",
      path: ["empresa_id"],
    }
  );

export const UsuariosCreate = () => {
  const [empresas, setEmpresas] = useState([]);
  const [icts, setIcts] = useState([]);
  const [tipo, setTipo] = useState("admin");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [phoneMask, setPhoneMask] = useState("(99) 9999-9999");
  const navigate = useNavigate();

  const tipos = [
    { value: "admin", label: "Administrador" },
    { value: "empresa", label: "Empresa" },
    { value: "ict", label: "Institução de Ciência e Tecnologia (ICT)" },
  ];

  useEffect(() => {
    fetchEmpresas();
    fetchIcts();
  }, []);

  const fetchEmpresas = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/empresas");
      setEmpresas(
        response.data.map((empresa) => ({
          value: empresa.id,
          label: empresa.nome,
        }))
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Erro ao carregar empresas.";
      toast({
        title: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchIcts = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/icts");
      setIcts(
        response.data.map((ict) => ({
          value: ict.id,
          label: ict.nome,
        }))
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Erro ao carregar ICTs.";
      toast({
        title: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    form.handleSubmit(handleSubmit)();
  };

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await api.post("/usuarios", {
        ...data,
        telefone: data.telefone?.replace(/\D/g, ""),
        // O vinculo nao selecionado e null; zero nao e um ID valido.
        empresa_id: data.tipo === "empresa" ? data.empresa_id : null,
        ict_id: data.tipo === "ict" ? data.ict_id : null,
      });

      toast({
        title: "Usuário criado com sucesso.",
        variant: "success",
      });

      navigate("/usuarios");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Erro ao criar usuário. Tente novamente.";

      toast({
        title: errorMessage,
        variant: "destructive",
      });

      if (error.response?.status === 403) {
        form.setError("root", {
          type: "manual",
          message: "Você não tem permissão para criar usuários.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const form = useForm({
    resolver: zodResolver(usuarioFormSchema),
    defaultValues: {
      nome: "",
      email: "",
      senha: "",
      tipo: "admin",
      endereco: "",
      telefone: "",
      cnpj: "",
      empresa_id: 0,
      ict_id: 0,
    },
  });

  return (
    <MainWrapper title="Novo usuário">
      <div className="flex items-center justify-between">
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
          className="bg-green-500 text-white font-bold hover:text-white hover:bg-green-600"
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
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem className="col-span-2 md:col-span-1">
                  <FormLabel>
                    Tipo de Usuário <RequiredFieldSpan />
                  </FormLabel>
                  <Select
                    onValueChange={(value) => {
                      setTipo(value);
                      field.onChange(value);
                    }}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {tipos.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {tipo === "ict" ? (
              <FormField
                control={form.control}
                name="ict_id"
                render={({ field }) => (
                  <FormItem className="col-span-2 md:col-span-1">
                    <FormLabel>
                      ICT <RequiredFieldSpan />
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                          disabled={isSubmitting}
                        >
                          {field.value
                            ? icts.find((ict) => ict.value === field.value)
                                ?.label
                            : "Selecione"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Buscar ICT..."
                            disabled={isSubmitting}
                          />
                          {isLoading ? (
                            <div className="flex my-3 items-center justify-center">
                              <Loader2 className="h-6 w-6 animate-spin mr-2" />
                              Carregando ICTs...
                            </div>
                          ) : (
                            <CommandList>
                              <CommandEmpty>
                                Nenhuma ICT encontrada
                              </CommandEmpty>
                              <CommandGroup>
                                {icts.map((ict) => (
                                  <CommandItem
                                    key={ict.value}
                                    onSelect={() => {
                                      field.onChange(ict.value);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value === ict.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {ict.label}
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
            ) : tipo === "empresa" ? (
              <FormField
                control={form.control}
                name="empresa_id"
                render={({ field }) => (
                  <FormItem className="col-span-2 md:col-span-1">
                    <FormLabel>
                      Empresa <RequiredFieldSpan />
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                          disabled={isSubmitting}
                        >
                          {field.value
                            ? empresas.find(
                                (empresa) => empresa.value === field.value
                              )?.label
                            : "Selecione"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Buscar empresa..."
                            disabled={isSubmitting}
                          />
                          {isLoading ? (
                            <div className="flex my-3 items-center justify-center">
                              <Loader2 className="h-6 w-6 animate-spin mr-2" />
                              Carregando empresas...
                            </div>
                          ) : (
                            <CommandList>
                              <CommandEmpty>
                                Nenhuma empresa encontrada
                              </CommandEmpty>
                              <CommandGroup>
                                {empresas.map((empresa) => (
                                  <CommandItem
                                    key={empresa.value}
                                    onSelect={() => {
                                      field.onChange(empresa.value);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value === empresa.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {empresa.label}
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
            ) : null}

            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => {
                return (
                  <FormItem className="col-span-2 md:col-span-1">
                    <FormLabel>
                      Nome <RequiredFieldSpan />
                    </FormLabel>
                    <FormControl>
                      <Input type="text" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => {
                return (
                  <FormItem className="col-span-2 md:col-span-1">
                    <FormLabel>
                      E-mail{" "}
                      <span className="font-normal text-xs">
                        (será usado para entrar na plataforma)
                      </span>{" "}
                      <RequiredFieldSpan />
                    </FormLabel>
                    <FormControl>
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
                    Senha <RequiredFieldSpan />
                  </FormLabel>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      {...field}
                      className="pr-10"
                    />
                    <button
                      type="button"
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
                  <FormMessage />
                </FormItem>
              )}
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
      </div>
    </MainWrapper>
  );
};
