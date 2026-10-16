import { MainWrapper } from "@/components/MainWrapper";
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeftCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/Field";
import { formatDatetime } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import api from "@/axios";

export const EmpresasView = () => {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [empresa, setEmpresa] = useState(null);
  const navigate = useNavigate();

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

  const fetchEmpresas = async () => {
    setIsLoading(true);

    try {
      const response = await api.get(`/empresas/${id}`);

      if (response?.data) {
        setEmpresa(response?.data);
      } else {
        throw new Error("Empresa não encontrada");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Erro ao carregar empresa.";
      toast({
        title: errorMessage,
        variant: "destructive",
      });
      navigate("/empresas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  return (
    <MainWrapper title={empresa?.nome}>
      <div className="flex items-center justify-between">
        <Link to="/empresas">
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
          Carregando empresa...
        </div>
      ) : (
        <div className="grid grid-cols-1 mt-5 lg:grid-cols-2 gap-6 w-full">
          <Field label="Nome" value={`${empresa.nome}`} />
          <Field label="E-mail" value={`${empresa.email}`} />
          <Field
            label="Telefone/celular"
            value={formatPhone(empresa.telefone)}
          />
          <Field label="Área de atuação" value={`${empresa.area || "-"}`} />
          <Field
            label="Cidade"
            value={empresa.cidade || "-"}
          />
          <Field
            label="UF"
            value={empresa.uf || "-"}
          />
          <div className="space-y-1.5">
            <div className="text-sm font-semibold text-gray-900">Site</div>
            <div className="text-sm text-gray-600">
              {empresa.site ? (
                <a href={empresa.site} target="_blank" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">{empresa.site}</a>
              ) : (
                "-"
              )}
            </div>
          </div>
          <Field
            label="Data de criação"
            value={`${formatDatetime(empresa.createdAt) || "-"}`}
          />
          <Field
            label="Data de alteração"
            value={`${formatDatetime(empresa.updatedAt) || "-"}`}
          />
        </div>
      )}
    </MainWrapper>
  );
};
