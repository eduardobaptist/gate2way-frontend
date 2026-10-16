import { MainWrapper } from "@/components/MainWrapper";
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeftCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/Field";
import { formatDatetime } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import api from "@/axios";

export const UsuariosView = () => {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  const formatPhone = (phone) => {
    // Telefone pode ser null no banco; a string vazia evita erro em replace().
    const digits = (phone || "").replace(/\D/g, "");

    if (digits.length === 11) {
      return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (digits.length === 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }

    return phone;
  };

  const fetchUsuario = async () => {
    setIsLoading(true);

    try {
      const response = await api.get(`/usuarios/${id}`);

      if (response?.data) {
        setUsuario(response?.data);
      } else {
        throw new Error("Usuário não encontrado");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Erro ao carregar usuário";
      toast({
        title: errorMessage,
        variant: "destructive",
      });
      navigate("/usuarios");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuario();
  }, []);

  return (
    <MainWrapper title={usuario?.nome}>
      <div className="flex items-center justify-between">
        <Link to="/usuarios">
          <Button
            className="bg-[var(--azul-agregar)] text-white hover:text-white hover:bg-[var(--azul-agregar-hover)]"
            variant="outline"
          >
            <ArrowLeftCircle className="mr-2" size="20" />
            Voltar
          </Button>
        </Link>
      </div>
      {isLoading ? (
        <div className="flex mt-5 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Carregando usuário...
        </div>
      ) : (
        <div className="grid grid-cols-1 mt-5 lg:grid-cols-2 gap-6 w-full">
          <Field label="E-mail" value={`${usuario.email}`} />
          <Field label="Nome" value={usuario.nome} />
          <Field label="Telefone/celular" value={formatPhone(usuario.telefone) || "-"} />
          <Field
            label="Data de criação"
            value={`${formatDatetime(usuario.createdAt) || ""}`}
          />
          <Field
            label="Data de alteração"
            value={`${formatDatetime(usuario.updatedAt) || ""}`}
          />
        </div>
      )}
    </MainWrapper>
  );
};
