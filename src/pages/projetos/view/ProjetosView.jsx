import { OrganizationLogo } from "@/components/OrganizationLogo";
import { MainWrapper } from "@/components/MainWrapper";
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftCircle,
  Loader2,
  Heart,
  Building2,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/hooks/use-toast";
import api from "@/axios";
import { useAuth } from "@/contexts/AuthContext";

import { TabGeral } from "@/pages/projetos/view/TabGeral";
import { TabPropostas } from "@/pages/projetos/view/TabPropostas";
import { TabHistorico } from "@/pages/projetos/view/TabHistorico";
import { TabCanvas } from "@/pages/projetos/view/TabCanvas";

export const ProjetosView = () => {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [projeto, setProjeto] = useState(null);
  const [tab, setTab] = useState("geral");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [observacoes, setObservacoes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();

  const tabOptions = [
    { value: "geral", label: "Geral" },
    ...(["admin", "empresa"].includes(user?.tipo)
      ? [
          { value: "propostas", label: "Propostas" },
          // { value: "historico", label: "Histórico" },
        ]
      : []),
    { value: "canvas", label: "Project canvas" },
  ];

  const fetchProjeto = async () => {
    setIsLoading(true);

    try {
      const response = await api.get(`/projetos/${id}`);

      if (response?.data) {
        setProjeto(response?.data);
      } else {
        throw new Error("Projeto não encontrado");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Erro ao carregar projeto.";
      toast({
        title: errorMessage,
        variant: "destructive",
      });
      navigate("/projetos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjeto();
  }, []);

  const handleDemonstrarInteresse = async () => {
    try {
      setIsSubmitting(true);
      await api.post("/interesses", {
        observacoes,
        oferta_id: projeto.Oferta?.[0].id,
      });
      setDialogOpen(false);
      toast({ title: "Interesse enviado com sucesso", variant: "success" });
    } catch (error) {
      console.error(error);
      toast({
        title: error.response?.data?.message || "Erro ao enviar interesse",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainWrapper title={projeto?.nome}>
      <Tabs defaultValue="geral" value={tab} onValueChange={setTab}>
        <div className="flex flex-col mb-5 sm:flex-row items-start sm:items-center gap-3 sm:gap-5">
          <Link to="/projetos">
            <Button
              className="bg-[var(--azul-agregar)] text-white hover:text-white hover:bg-[var(--azul-agregar-hover)]"
              variant="outline"
            >
              <ArrowLeftCircle className="mr-2" size="20" />
              Voltar
            </Button>
          </Link>

          {isMobile ? (
            <div className="w-full sm:w-auto min-w-[250px]">
              <Select value={tab} onValueChange={setTab}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma seção" />
                </SelectTrigger>
                <SelectContent>
                  {tabOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <TabsList>
              {tabOptions.map((option) => (
                <TabsTrigger key={option.value} value={option.value}>
                  {option.label}
                </TabsTrigger>
              ))}
            </TabsList>
          )}

          {user?.tipo === "ict" && (
            <Button
              className="bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white font-semibold shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
              style={{
                animation: "expandButton 2s ease-in-out infinite",
              }}
              onClick={() => setDialogOpen(true)}
            >
              <Heart className="mr-2 fill-current" size="20" />
              Demonstrar Interesse
            </Button>
          )}

          <style>{`
            @keyframes expandButton {
              0%, 100% {
                transform: scale(1);
              }
              50% {
                transform: scale(1.05);
              }
            }
          `}</style>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Demonstrar interesse
              </DialogTitle>
              <DialogDescription className="">
                <div className="flex items-start gap-3 mt-6 p-3 border border-gray-200 rounded-lg">
                  <OrganizationLogo src={projeto?.Programa?.Rota?.Empresa?.foto_perfil ? `${import.meta.env.VITE_API_URL}${projeto.Programa.Rota.Empresa.foto_perfil}` : null} name={projeto?.Programa?.Rota?.Empresa?.nome} className="h-11 w-11 rounded-full border p-1" />
                  <div className="flex flex-col truncate">
                    <span className="font-semibold text-base text-left">
                      {projeto?.nome}
                    </span>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground truncate">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{projeto?.Programa?.Rota?.Empresa?.nome}</span>
                    </div>
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="observacoes">
                  Observações <span className="text-gray-500">(opcional)</span>
                </Label>
                <Textarea
                  id="observacoes"
                  placeholder={`Conte para ${
                    projeto?.Programa?.Rota?.Empresa?.nome_fantasia ||
                    projeto?.Programa?.Rota?.Empresa?.razao_social ||
                    "a empresa"
                  } sobre seu interesse neste projeto...`}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                className="mt-2 md:mt-0"
                onClick={() => {
                  setDialogOpen(false);
                  setObservacoes("");
                }}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDemonstrarInteresse}
                disabled={isSubmitting}
                className="bg-green-500 text-white hover:text-white hover:bg-green-600"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  <>Confirmar</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <div className="flex mt-5 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Carregando projeto...
          </div>
        ) : (
          <>
            <TabsContent value="geral">
              <TabGeral projeto={projeto} />
            </TabsContent>

            <TabsContent value="propostas">
              <TabPropostas projeto={projeto} onRefresh={fetchProjeto} />
            </TabsContent>

            {/* <TabsContent value="historico">
              <TabHistorico projeto={projeto} />
            </TabsContent>  */}

            <TabsContent value="canvas">
              {isMobile ? (
                <Alert>
                  <Monitor className="h-4 w-4" />
                  <AlertTitle>Visualização não disponível</AlertTitle>
                  <AlertDescription>
                    O Project Canvas não pode ser visualizado em dispositivos móveis. 
                    Por favor, acesse através de um computador ou tablet para utilizar esta funcionalidade.
                  </AlertDescription>
                </Alert>
              ) : (
                <TabCanvas initialData={JSON.parse(projeto?.estilo)} />
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </MainWrapper>
  );
};
