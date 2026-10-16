import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

export const CidadeCombobox = ({ form, isSubmitting }) => {
  const [openCidade, setOpenCidade] = useState(false);
  const [cidades, setCidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const ufSelecionada = form.watch("uf");

  useEffect(() => {
    // UX Gate2Way: ao trocar a UF, uma resposta antiga não pode substituir suas cidades.
    const controller = new AbortController();
    const fetchCidades = async () => {
      if (!ufSelecionada) {
        setCidades([]);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setCidades([]);

      try {
        const response = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${ufSelecionada}/municipios`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Erro ao carregar cidades");
        }

        const data = await response.json();
        if (controller.signal.aborted) return;
        const cidadesOrdenadas = data
          .map((municipio) => municipio.nome)
          .sort((a, b) => a.localeCompare(b));

        setCidades(cidadesOrdenadas);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError("Não foi possível carregar as cidades. Tente novamente.");
        setCidades([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchCidades();
    return () => controller.abort();
  }, [ufSelecionada, retryCount]);

  return (
    <FormField
      control={form.control}
      name="cidade"
      render={({ field }) => (
        <FormItem className="col-span-2 md:col-span-1">
          <FormLabel>Cidade</FormLabel>
          <Popover open={openCidade} onOpenChange={setOpenCidade}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCidade}
                  disabled={isSubmitting || !ufSelecionada || loading}
                  className={cn(
                    "w-full justify-between",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {loading ? (
                    <section className="flex justify-start items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Carregando cidades...
                    </section>
                  ) : field.value ? (
                    field.value
                  ) : ufSelecionada ? (
                    "Selecione uma cidade"
                  ) : (
                    "Selecione primeiro uma UF"
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] max-w-[calc(100vw-2rem)] p-0">
              <Command>
                <CommandInput placeholder="Buscar cidade..." />
                <CommandEmpty>
                  {error
                    ? "Erro ao carregar cidades"
                    : "Nenhuma cidade encontrada."}
                </CommandEmpty>
                <CommandList>
                  {cidades.map((cidade) => (
                    <CommandItem
                      value={cidade}
                      key={cidade}
                      onSelect={() => {
                        form.setValue("cidade", cidade);
                        setOpenCidade(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          cidade === field.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {cidade}
                    </CommandItem>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {loading && <p role="status" className="text-sm text-slate-700">Carregando cidades...</p>}
          {error && <div role="alert" className="text-sm text-red-700">
            <p>{error}</p>
            <Button type="button" variant="outline" size="sm" className="mt-2" disabled={isSubmitting} onClick={() => setRetryCount((count) => count + 1)}>Tentar novamente</Button>
          </div>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
