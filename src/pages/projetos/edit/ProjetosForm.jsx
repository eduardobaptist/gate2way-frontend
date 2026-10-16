import React, { useState, useEffect, forwardRef } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RequiredFieldSpan } from "@/components/RequiredFieldSpan";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ptBR } from "date-fns/locale";
import { ChevronsUpDown, Check, Loader2, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import api from "@/axios";

const projectFormSchema = z
  .object({
    nome: z.string().min(1, "Nome é obrigatório"),
    descricao: z.string().min(1, "Descrição é obrigatória"),
    programa_id: z.number().min(1, "Programa é obrigatório"),
    data_inicio: z.date({
      invalid_type_error: "Formato de data inválido",
    }),
    data_fim: z.date({
      invalid_type_error: "Formato de data inválido",
    }),
    trl: z.string().nullable(),
    acatech: z.string().nullable(),
    prioridade: z.string().min(1, "Prioridade é obrigatória"),
    impulso: z.boolean(),
    impulso_id: z.number().nullable(),
    upload: z
      .instanceof(FileList)
      .refine(
        (files) => {
          const allowedExtensions = ["pdf", "doc", "docx", "odt"];
          return allowedExtensions.includes(
            files[0].name.split(".").pop().toLowerCase()
          );
        },
        {
          message: "Apenas arquivos PDF, Word (doc, docx) e ODT são permitidos",
        }
      )
      .nullable(),
  })
  .refine(
    (data) => {
      if (data.impulso === true) {
        return data.impulso_id !== null;
      }

      return true;
    },
    {
      message: "Selecione um impulso acadêmico",
      path: ["impulso_id"],
    }
  )
  .refine((data) => data.data_inicio < data.data_fim, {
    message: "A data de início deve ser anterior à data de término",
    path: ["data_inicio"],
  });

export const ProjetosForm = forwardRef(({ onSubmit, formData, isSubmitting = false }, ref) => {
  const [programasOpen, setProgramasOpen] = useState(false);
  const [impulsosOpen, setImpulsosOpen] = useState(false);
  const [hasImpulso, setHasImpulso] = useState(false);
  const [programas, setProgramas] = useState([]);
  const [impulsos, setimpulsos] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  const form = useForm({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      data_inicio: new Date(),
      data_fim: null,
      programa_id: 0,
      trl: "null",
      acatech: "null",
      prioridade: "",
      impulso: false,
      impulso_id: null,
      upload: null,
    },
  });

  useEffect(() => {
    const loadOptions = async () => {
      setIsLoadingOptions(true);
      try {
        const [programasRes, impulsosRes] = await Promise.all([
          api.get("/programas"),
          api.get("/impulsos"),
        ]);

        setProgramas(
          programasRes.data.map((programa) => ({
            value: programa.id,
            label: programa.nome,
          }))
        );

        setimpulsos(
          impulsosRes.data.map((impulso) => ({
            value: impulso.id,
            label: impulso.descricao,
          }))
        );
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Erro ao carregar opções.";
        toast({
          title: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoadingOptions(false);
      }
    };

    loadOptions();
  }, []);

  // Reset do formulário quando formData chega
  useEffect(() => {
    if (formData) {
      const hasImpulsoValue = !!formData.impulso_id;
      const programaId = formData.programa_id
        ? Number(formData.programa_id)
        : 0;
      const impulsoId = formData.impulso_id
        ? Number(formData.impulso_id)
        : null;

      form.reset({
        nome: formData.nome || "",
        descricao: formData.descricao || "",
        data_inicio: formData.data_inicio
          ? new Date(formData.data_inicio)
          : new Date(),
        data_fim: formData.data_fim ? new Date(formData.data_fim) : null,
        programa_id: programaId,
        trl: formData.trl || "null",
        acatech: formData.acatech || "null",
        prioridade: formData.prioridade || "",
        impulso: hasImpulsoValue,
        impulso_id: impulsoId,
        upload: null,
      });

      setHasImpulso(hasImpulsoValue);
    }
  }, [formData, form]);

  const handleFormSubmit = (data) => {
    if (!isSubmitting && onSubmit) {
      const formDataToSend = new FormData();

      formDataToSend.append("nome", data.nome);
      formDataToSend.append("descricao", data.descricao);
      formDataToSend.append("data_inicio", data.data_inicio);
      formDataToSend.append("data_fim", data.data_fim);
      formDataToSend.append("programa_id", data.programa_id);
      if (data.trl !== "null") {
        formDataToSend.append("trl", data.trl);
      }
      if (data.acatech !== "null") {
        formDataToSend.append("acatech", data.acatech);
      }
      formDataToSend.append("prioridade", data.prioridade);
      if (data.impulso_id !== null) {
        formDataToSend.append("impulso_id", data.impulso_id);
      }
      if (data.upload && data.upload.length > 0) {
        formDataToSend.append("upload", data.upload[0]);
      }

      onSubmit(formDataToSend);
    }
  };

  const handleProgramas = () => {
    setProgramasOpen(!programasOpen);
  };

  const handleImpulsos = () => {
    setImpulsosOpen(!impulsosOpen);
  };

  const renderSelect = (name, label, options, required) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label} {required && <RequiredFieldSpan />}
          </FormLabel>
          <Select onValueChange={field.onChange} value={String(field.value)}>
            <FormControl><SelectTrigger>
              <SelectValue
                placeholder={required ? "Selecione" : "Indefinido"}
              />
            </SelectTrigger></FormControl>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Form {...form}>
      <form
        ref={ref}
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="mx-auto max-w-4xl space-y-4"
      >
        <div className="grid grid-cols-1 gap-4">
          <fieldset disabled={isSubmitting} className="min-w-0 space-y-4 p-4 bg-white rounded-md shadow-sm border border-gray-300 block">
            <legend className="text-md px-2 font-semibold text-gray-800 border-gray-200">
              Geral
            </legend>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nome do projeto <RequiredFieldSpan />
                      </FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Descrição <RequiredFieldSpan />
                      </FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="programa_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Programa do projeto <RequiredFieldSpan />
                      </FormLabel>
                      <Popover
                        open={programasOpen}
                        onOpenChange={handleProgramas}
                      >
                        <PopoverTrigger asChild>
                          <FormControl><Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={programasOpen}
                            className="w-full justify-between"
                          >
                            {field.value
                              ? programas.find(
                                  (prog) => prog.value === field.value
                                )?.label
                              : "Selecione"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button></FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] max-w-[calc(100vw-2rem)] p-0">
                          <Command>
                            <CommandInput placeholder="Buscar programa..." />
                            {isLoadingOptions ? (
                              <div className="flex my-3 items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                Carregando programas...
                              </div>
                            ) : (
                              <CommandList>
                                <CommandEmpty>
                                  Nenhum programa encontrado.
                                </CommandEmpty>
                                <CommandGroup>
                                  {programas.map((prog) => (
                                    <CommandItem
                                      key={prog.value}
                                      onSelect={() => {
                                        field.onChange(prog.value);
                                        setProgramasOpen(false);
                                      }}
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
              </div>
              <div className="flex min-w-0 flex-col xl:flex-row xl:gap-8">
                <FormField
                  control={form.control}
                  name="impulso"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel>Possui impulso acadêmico?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          aria-label="Possui impulso acadêmico?"
                          onValueChange={(value) => {
                            const isImpulso = value === "true";
                            field.onChange(isImpulso);
                            setHasImpulso(isImpulso);

                            if (!isImpulso) {
                              form.setValue("impulso_id", null);
                            }
                          }}
                          value={field.value ? "true" : "false"}
                          className="flex gap-4"
                        >
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="true" />
                            </FormControl>
                            <FormLabel className="font-normal">Sim</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="false" />
                            </FormControl>
                            <FormLabel className="font-normal">Não</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {hasImpulso && (
                  <div className="mt-4 md:mt-0 flex-1">
                    <FormField
                      control={form.control}
                      name="impulso_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Impulso acadêmico <RequiredFieldSpan />
                          </FormLabel>
                          <Popover
                            open={impulsosOpen}
                            onOpenChange={handleImpulsos}
                          >
                            <PopoverTrigger asChild>
                              <FormControl><Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={impulsosOpen}
                                className="w-full justify-between"
                              >
                                {field.value
                                  ? impulsos.find(
                                      (impulso) => impulso.value === field.value
                                    )?.label
                                  : "Selecione"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button></FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] max-w-[calc(100vw-2rem)] p-0">
                              <Command>
                                <CommandInput placeholder="Buscar impulso..." />
                                {isLoadingOptions ? (
                                  <div className="flex my-3 items-center justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                    Carregando impulsos...
                                  </div>
                                ) : (
                                  <CommandList>
                                    <CommandEmpty>
                                      Nenhum impulso encontrado.
                                    </CommandEmpty>
                                    <CommandGroup>
                                      {impulsos.map((impulso) => (
                                        <CommandItem
                                          key={impulso.value}
                                          onSelect={() => {
                                            field.onChange(impulso.value);
                                            setImpulsosOpen(false);
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              field.value === impulso.value
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                          {impulso.label}
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
                  </div>
                )}
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="data_inicio"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>
                        Data de início <RequiredFieldSpan />
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
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
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="data_fim"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>
                        Data de término <RequiredFieldSpan />
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
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
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="upload"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>
                        Upload do arquivo com mais informações
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          onChange={(e) => onChange(e.target.files)}
                          {...fieldProps}
                          className="w-full pr-10 cursor-pointer"
                          accept=".pdf,.doc,.docx,.odt"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </fieldset>

          <fieldset disabled={isSubmitting} className="min-w-0 space-y-4 mt-5 p-4 bg-white rounded-md shadow-sm border border-gray-300 block">
            <legend className="text-md px-2 font-semibold text-gray-800 border-gray-200">
              Métricas
            </legend>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div>
                {renderSelect(
                  "trl",
                  "Nível TRL",
                  [
                    { value: "null", label: "Indefinido" },
                    { value: "1", label: "1. A teoria" },
                    { value: "2", label: "2. O protótipo" },
                    { value: "3", label: "3. O MVP" },
                  ],
                  false
                )}
              </div>
              <div>
                {renderSelect(
                  "acatech",
                  "Nível ACATECH",
                  [
                    { value: "null", label: "Indefinido" },
                    { value: "1", label: "1. Computadorização" },
                    { value: "2", label: "2. Conectividade" },
                    { value: "3", label: "3. Visibilidade" },
                  ],
                  false
                )}
              </div>
              <div>
                {renderSelect(
                  "prioridade",
                  "Prioridade",
                  [
                    { value: "1", label: "Baixa" },
                    { value: "2", label: "Média" },
                    { value: "3", label: "Alta" },
                  ],
                  true
                )}
              </div>
            </div>
          </fieldset>
        </div>
      </form>
    </Form>
  );
});
