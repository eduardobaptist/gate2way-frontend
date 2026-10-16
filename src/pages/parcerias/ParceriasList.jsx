import { OrganizationLogo } from "@/components/OrganizationLogo";
import { MainWrapper } from "@/components/MainWrapper";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Filter, Loader2, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatDatetime } from "@/lib/utils";
import { Link } from "react-router-dom";
import api from "@/axios";

export const ParceriasList = () => {
  const [filterType, setFilterType] = useState("proposta");
  const [searchTerm, setSearchTerm] = useState("");
  const [parcerias, setParcerias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const filters = [
    { value: "proposta", label: "Projeto" },
    { value: "empresa", label: "Empresa" },
    { value: "responsavel", label: "Responsável da ICT" },
    { value: "email", label: "E-mail do responsável" },
    { value: "ict", label: "ICT" },
    { value: "dataCricao", label: "Data de criação" },
  ];

  const fetchParcerias = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get("/parcerias");
      setParcerias(response.data);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Erro ao carregar parcerias.";
      setError(errorMessage);
      toast({
        title: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchParcerias();
  }, []);

  // A busca usa apenas a data; a célula mantém também o horário.
  const formatDataCriacao = (dateValue) => {
    if (!dateValue || Number.isNaN(new Date(dateValue).getTime())) return "—";
    return formatDatetime(dateValue);
  };

  const filteredParcerias = (parcerias || []).filter((parceria) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    // UX Gate2Way: os filtros consultam os relacionamentos que a API já retorna.
    switch (filterType) {
      case "proposta":
        return parceria.Interesse?.Oferta?.Projeto?.nome?.toLowerCase().includes(searchLower);
      case "empresa":
        return parceria.Interesse?.Oferta?.Projeto?.Programa?.Rota?.Empresa?.nome?.toLowerCase().includes(searchLower);
      case "ict":
        return parceria.Interesse?.Usuario?.Responsavels?.[0]?.Ict?.nome?.toLowerCase().includes(searchLower);
      case "responsavel":
        return parceria.Interesse?.Usuario?.nome?.toLowerCase().includes(searchLower);
      case "email":
        return parceria.Interesse?.Usuario?.email?.toLowerCase().includes(searchLower);
      case "dataCricao":
        return formatDataCriacao(parceria.createdAt).split(" às ")[0].includes(searchLower);
      default:
        return true;
    }
  });

  return (
    <MainWrapper title="Parcerias">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex col-span-2 md:col-span-1">
          <Select
            value={filterType}
            onValueChange={(value) => setFilterType(value)}
          >
            <SelectTrigger aria-label="Campo de busca" className="shrink-0 w-max rounded-r-none border-r-0">
              <SelectValue>
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <span className="mr-2">
                    {filters.find((f) => f.value === filterType)?.label}
                  </span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {filters.map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex relative w-full">
            <div className="w-full flex-grow">
              <Input
                type="text"
                placeholder="Buscar"
                aria-label="Buscar registros"
                className="rounded-l-none pl-3 pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 transform h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="mt-5">
        <div className="rounded-lg overflow-hidden border bg-card shadow-sm">
          <Table>
            <TableCaption>Responsável e e-mail referem-se à ICT.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Projeto</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>ICT</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Data de criação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Carregando parcerias...
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-red-500"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : filteredParcerias.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-gray-500"
                  >
                    {parcerias.length === 0 ? "Nenhuma parceria encontrada. As parcerias serão exibidas aqui após a aprovação das propostas." : "Nenhuma parceria corresponde aos filtros."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredParcerias.map((parceria) => (
                  <TableRow key={parceria.id}>
                    <TableCell>
                      <div className="max-w-md relative group">
                        <div className="flex items-center truncate group-hover:whitespace-normal transition-all duration-300 ease-in-out hover:scale-100 opacity-90 hover:opacity-100">
                          {parceria.Interesse?.Oferta?.Projeto?.id ? (
                            <Link
                              to={`/projetos/${parceria.Interesse?.Oferta?.Projeto?.id}`}
                              className="text-blue-700 hover:underline"
                            >
                              {parceria.Interesse?.Oferta?.Projeto?.nome || "—"}
                              <ExternalLink className="inline-block ml-2 h-4 w-4" />
                            </Link>
                          ) : (parceria.Interesse?.Oferta?.Projeto?.nome || "—")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md relative flex items-center group">
                        <OrganizationLogo src={parceria.Interesse?.Oferta?.Projeto?.Programa?.Rota?.Empresa?.foto_perfil ? `${import.meta.env.VITE_API_URL}${parceria.Interesse.Oferta.Projeto.Programa.Rota.Empresa.foto_perfil}` : null} name={parceria.Interesse?.Oferta?.Projeto?.Programa?.Rota?.Empresa?.nome} className="mr-2 rounded-full border p-1" />
                        <div className="truncate group-hover:whitespace-normal transition-all duration-300 ease-in-out hover:scale-100 opacity-90 hover:opacity-100">
                          {
                            parceria.Interesse?.Oferta?.Projeto?.Programa?.Rota
                              ?.Empresa?.nome
                          }
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md relative flex items-center group">
                        <OrganizationLogo src={parceria.Interesse?.Usuario?.Responsavels?.[0]?.Ict?.foto_perfil ? `${import.meta.env.VITE_API_URL}${parceria.Interesse.Usuario.Responsavels?.[0].Ict.foto_perfil}` : null} name={parceria.Interesse?.Usuario?.Responsavels?.[0]?.Ict?.nome} className="mr-2 rounded-full border p-1" />
                        <div className="truncate group-hover:whitespace-normal transition-all duration-300 ease-in-out hover:scale-100 opacity-90 hover:opacity-100">
                          {
                            parceria.Interesse?.Usuario?.Responsavels?.[0]?.Ict
                              ?.nome
                          }
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md relative group">
                        <div className="truncate group-hover:whitespace-normal transition-all duration-300 ease-in-out hover:scale-100 opacity-90 hover:opacity-100">
                          {parceria.Interesse?.Usuario?.nome}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md relative group">
                        <div className="truncate group-hover:whitespace-normal transition-all duration-300 ease-in-out hover:scale-100 opacity-90 hover:opacity-100">
                          {parceria.Interesse?.Usuario?.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDatetime(parceria.createdAt) || "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </MainWrapper>
  );
};
