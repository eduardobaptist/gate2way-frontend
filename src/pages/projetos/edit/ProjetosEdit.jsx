import { useState, useRef, useEffect, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "@/axios";
import { MainWrapper } from "@/components/MainWrapper";
import { ProjetosProjectCanvas } from "@/pages/projetos/edit/ProjetosProjectCanvas";
import { ProjetosForm } from "@/pages/projetos/edit/ProjetosForm";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftCircle,
  CheckCircleIcon,
  Library,
  PanelsTopLeftIcon,
  Monitor,
} from "lucide-react";

export const ProjetosEdit = () => {
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [layout, setLayout] = useState("infosGerais");
  const [canvasData, setCanvasData] = useState(null);
  const [projectCanvasInitialData, setProjectCanvasInitialData] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [projectData, setProjectData] = useState(null);
  const projectFormRef = useRef(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProject = async () => {
      setIsLoading(true);

      try {
        const response = await api.get(`/projetos/${id}`);
        const data = {
          nome: response.data.nome,
          descricao: response.data.descricao,
          data_inicio: response.data.data_inicio,
          data_fim: response.data.data_fim,
          programa_id: response.data?.Programa?.id || 0,
          trl: response.data.trl?.toString() || "null",
          acatech: response.data.acatech?.toString() || "null",
          prioridade: response.data.prioridade?.toString() || "",
          impulso: response.data.impulso_id || false,
          impulso_id: response.data.impulso_id || null,
          upload: null,
        };

        let parsedEstilo = {};
        if (response.data.estilo) {
          try {
            parsedEstilo = JSON.parse(response.data.estilo);
          } catch (e) {
            console.error("Erro ao parsear estilo:", e);
            parsedEstilo = {};
          }
        }

        setProjectCanvasInitialData(parsedEstilo);
        setCanvasData(parsedEstilo);
        setProjectData(data);
      } catch (error) {
        console.error("Erro ao carregar projeto:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, []);

  const handleSave = useCallback(() => {
    if (!isSubmitting && !submittingRef.current && projectFormRef.current) {
      projectFormRef.current.requestSubmit();
    }
  }, [isSubmitting]);

  const onSubmit = useCallback(
    async (formData) => {
      // Bloqueia envios repetidos antes de o React atualizar os botoes.
      if (submittingRef.current) return;
      submittingRef.current = true;
      setIsSubmitting(true);
      try {

        formData.append(
          "justificativas",
          canvasData?.["justificativas"]?.textarea_value ?? ""
        );
        formData.append("objsmart", canvasData?.["objsmart"]?.textarea_value ?? "");
        formData.append("beneficios", canvasData?.["beneficios"]?.textarea_value ?? "");
        formData.append("produto", canvasData?.["produto"]?.textarea_value ?? "");
        formData.append("requisitos", canvasData?.["requisitos"]?.textarea_value ?? "");
        formData.append(
          "stakeholders",
          canvasData?.["stakeholders"]?.textarea_value ?? ""
        );
        formData.append("equipe", canvasData?.["equipe"]?.textarea_value ?? "");
        formData.append("premissas", canvasData?.["premissas"]?.textarea_value ?? "");
        formData.append(
          "grupo_de_entrega",
          canvasData?.["grupo_de_entrega"]?.textarea_value ?? ""
        );
        formData.append("restricoes", canvasData?.["restricoes"]?.textarea_value ?? "");
        formData.append("riscos", canvasData?.["riscos"]?.textarea_value ?? "");
        formData.append(
          "linha_do_tempo",
          canvasData?.["linha_do_tempo"]?.textarea_value ?? ""
        );
        formData.append("custos", canvasData?.["custos"]?.textarea_value ?? "");
        
        const cleanCanvasData = Object.entries(canvasData || {}).reduce(
          (acc, [key, widget]) => {
            acc[key] = {
              x: widget.x,
              y: widget.y,
              w: widget.w,
              h: widget.h,
              textarea_value: widget.textarea_value || "",
            };
            return acc;
          },
          {}
        );

        formData.append("estilo", JSON.stringify(cleanCanvasData));

        const response = await api.put(`/projetos/${id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        toast({
          title: "Projeto atualizado com sucesso.",
          variant: "success",
        });

        navigate("/projetos");
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          "Erro ao atualizar projeto. Tente novamente.";

        toast({
          title: errorMessage,
          variant: "destructive",
        });
      } finally {
        submittingRef.current = false;
        setIsSubmitting(false);
      }
    },
    [canvasData, id, navigate, toast]
  );

  return (
    <MainWrapper title="Editar projeto">
      {isMobile ? (
        <div className="space-y-3">
          <div className="flex justify-between align-center">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="bg-[var(--azul-agregar)] text-white hover:text-white hover:bg-[var(--azul-agregar-hover)]"
                  variant="outline"
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
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <Link to="/projetos">
                    <AlertDialogAction className="w-full md:w-fit">
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
          <div>
            <Tabs
              value={layout}
              defaultValue="grid"
              className="w-full h-max"
              onValueChange={setLayout}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="infosGerais">
                  <Library /> Informações gerais
                </TabsTrigger>
                <TabsTrigger value="projectCanvas">Project canvas</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      ) : (
        <div className="flex justify-between">
          <div className="flex items-center gap-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="bg-[var(--azul-agregar)] text-white hover:text-white hover:bg-[var(--azul-agregar-hover)]"
                  variant="outline"
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
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <Link to="/projetos">
                    <AlertDialogAction className="w-full md:w-fit">
                      Continuar
                    </AlertDialogAction>
                  </Link>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Tabs
              value={layout}
              defaultValue="grid"
              className="w-max h-max"
              onValueChange={setLayout}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="infosGerais">
                  <Library size="20" className="mr-2" />
                  Informações gerais
                </TabsTrigger>
                <TabsTrigger value="projectCanvas">
                  <PanelsTopLeftIcon size="20" className="mr-2" />
                  Project canvas
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
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
      )}
      <div className="mt-5">
        <div style={{ display: layout === "infosGerais" ? "block" : "none" }}>
          <ProjetosForm
            ref={projectFormRef}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            formData={projectData}
          />
        </div>
        <div style={{ display: layout === "projectCanvas" ? "block" : "none" }}>
          {isMobile ? (
            <Alert>
              <Monitor className="h-4 w-4" />
              <AlertTitle>Edição não disponível</AlertTitle>
              <AlertDescription>
                O Project Canvas não pode ser editado em dispositivos móveis. 
                Por favor, acesse através de um computador ou tablet para editar o canvas do projeto.
              </AlertDescription>
            </Alert>
          ) : (
            projectCanvasInitialData !== undefined && (
              <ProjetosProjectCanvas
                setCanvasData={setCanvasData}
                initialData={projectCanvasInitialData}
              />
            )
          )}
        </div>
      </div>
    </MainWrapper>
  );
};
