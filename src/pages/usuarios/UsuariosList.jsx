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
import { Badge } from "@/components/ui/badge";
import {
  Search,
  PlusCircle,
  Filter,
  Loader2,
  Building,
  UserCog,
  GraduationCap,
} from "lucide-react";
import { UsuariosActions } from "./UsuariosActions";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import api from "@/axios";
import { formatDatetime } from "@/lib/utils";

export const UsuariosList = () => {
  const [filterType, setFilterType] = useState("nome");
  const [searchTerm, setSearchTerm] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const filters = [
    { value: "nome", label: "Nome" },
    { value: "organizacao", label: "Organização" }, // novo filtro
    { value: "email", label: "Email" },
    { value: "tipo", label: "Tipo" },
    { value: "dataCriacao", label: "Data de criação" },
  ];

  const fetchUsuarios = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get("/usuarios");
      setUsuarios(response.data);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Erro ao carregar usuários.";
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
    fetchUsuarios();
  }, []);

  const filteredUsuarios = usuarios.filter((usuario) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    switch (filterType) {
      case "nome":
        return usuario.nome.toLowerCase().includes(searchLower);
      case "email":
        return usuario.email.toLowerCase().includes(searchLower);
      case "tipo":
        return usuario.tipo.toLowerCase().includes(searchLower);
      case "dataCriacao":
        return new Date(usuario.createdAt)
          .toLocaleDateString()
          .toLowerCase()
          .includes(searchLower);
      case "organizacao":
        const org =
          usuario.tipo === "ict"
            ? usuario?.Responsavels?.[0]?.Ict?.nome
            : usuario?.Responsavels?.[0]?.Empresa?.nome;

        return org?.toLowerCase().includes(searchLower);
      default:
        return true;
    }
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case "admin":
        return <UserCog className="h-4 w-4 mr-2 text-gray-500" />;
      case "empresa":
        return <Building className="h-4 w-4 mr-2 text-gray-500" />;
      case "ict":
        return <GraduationCap className="h-4 w-4 mr-2 text-gray-500" />;
      default:
        return <></>;
    }
  };

  return (
    <MainWrapper title="Usuários">
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
          <Link to="/usuarios/novo">
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
                <TableHead>Tipo</TableHead>
                <TableHead>Organização</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Data de criação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Carregando usuários...
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
              ) : filteredUsuarios.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-gray-500"
                  >
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell>
                      <UsuariosActions
                        usuario={usuario}
                        onRefresh={fetchUsuarios}
                      />
                    </TableCell>
                    <TableCell>{usuario.nome}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getTypeIcon(usuario.tipo)}
                        {usuario.tipo === "ict"
                          ? usuario.tipo.toUpperCase()
                          : usuario.tipo[0]?.toUpperCase() +
                            usuario.tipo.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                      <OrganizationLogo
                        src={usuario.tipo === "ict"
                          ? (usuario.Responsavels?.[0]?.Ict?.foto_perfil ? `${import.meta.env.VITE_API_URL}${usuario.Responsavels[0].Ict.foto_perfil}` : null)
                          : (usuario.Responsavels?.[0]?.Empresa?.foto_perfil ? `${import.meta.env.VITE_API_URL}${usuario.Responsavels[0].Empresa.foto_perfil}` : null)}
                        name={usuario.tipo === "ict" ? usuario.Responsavels?.[0]?.Ict?.nome : usuario.Responsavels?.[0]?.Empresa?.nome}
                        className="h-8 w-8 rounded-full border p-1"
                      />
                      <span>
                        {usuario.tipo === "ict"
                          ? usuario?.Responsavels?.[0]?.Ict?.nome || "-"
                          : usuario?.Responsavels?.[0]?.Empresa?.nome || "-"}
                      </span>
                    </TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>
                      {formatDatetime(usuario.createdAt) || "-"}
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
