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
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, PlusCircle, Filter, Loader2 } from "lucide-react";
import { IctsActions } from "./IctsActions";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { formatDatetime } from "@/lib/utils";
import api from "@/axios";

export const IctsList = () => {
  const [filterType, setFilterType] = useState("nome");
  const [searchTerm, setSearchTerm] = useState("");
  const [icts, setIcts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatPhone = (phone) => {
    if (!phone) return "-";
    const digits = phone.replace(/\D/g, "");

    if (digits.length === 11) {
      return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (digits.length === 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }

    return phone;
  };

  const filters = [
    { value: "nome", label: "Nome" },
    { value: "cnpj", label: "CNPJ" },
    { value: "telefone", label: "Telefone" },
    { value: "dataCriacao", label: "Data de criação" },
  ];

  const fetchIcts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get("/icts");
      setIcts(response.data);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Erro ao carregar ICTs.";
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
    fetchIcts();
  }, []);

  const filteredIcts = icts.filter((ict) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    switch (filterType) {
      case "nome":
        return ict.nome.toLowerCase().includes(searchLower);
      case "telefone":
        return ict.telefone
          ?.replace(/(\d{2})(\d{2})(\d{4})(\d{4})/, "+$1 ($2) $3-$4")
          .toLowerCase()
          .includes(searchLower);
      case "dataCriacao":
        return new Date(ict.createdAt)
          .toLocaleDateString()
          .toLowerCase()
          .includes(searchLower);
      default:
        return true;
    }
  });

  return (
    <MainWrapper title="Instituições de Ciência e Tecnologia (ICTs)">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex col-span-2 md:col-span-1">
          <Select
            defaultValue="nome"
            onValueChange={(value) => setFilterType(value)}
          >
            <SelectTrigger className="w-max rounded-r-none border-r-0">
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
                className="rounded-l-none pl-3"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 transform h-4 w-4 text-gray-400" />
          </div>
        </div>
        <div className="flex justify-between md:justify-end col-span-2 md:col-span-1 gap-2">
          <Link to="/icts/novo">
            <Button
              className="bg-[var(--azul-agregar)] text-white hover:text-white hover:bg-[var(--azul-agregar-hover)]"
              variant="outline"
            >
              <PlusCircle className="mr-2" size="20" />
              Novo
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-5">
        <div className="rounded-lg overflow-hidden border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone/celular</TableHead>
                <TableHead>Data de criação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Carregando ICTs...
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
              ) : filteredIcts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-gray-500"
                  >
                    Nenhuma ICT encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filteredIcts.map((ict) => (
                  <TableRow key={ict.id}>
                    <TableCell>
                      <IctsActions ict={ict} onRefresh={fetchIcts} />
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                      <OrganizationLogo src={ict.foto_perfil ? `${import.meta.env.VITE_API_URL}${ict.foto_perfil}` : null} name={ict.nome} className="h-8 w-8 rounded-full border p-1" />
                      <span>{ict.nome}</span>
                    </TableCell>
                    <TableCell>{ict.email || "-"}</TableCell>
                    <TableCell>{formatPhone(ict.telefone)}</TableCell>
                    <TableCell>
                      {formatDatetime(ict.createdAt) || "-"}
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
