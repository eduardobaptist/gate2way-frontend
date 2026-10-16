import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { MainWrapper } from "@/components/MainWrapper";
import { ProjetosProjectCanvas } from "@/pages/projetos/ProjetosProjectCanvas";
import { ProjetosForm } from "@/pages/projetos/ProjetosForm";
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
import { ArrowLeftCircle, CheckCircleIcon, Library, PanelsTopLeftIcon, Monitor } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import api from "@/axios";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const ProjetosCreate = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [layout, setLayout] = useState("infosGerais");
  const projectFormRef = useRef(null);
  const isMobile = useIsMobile();
  const [canvasData, setCanvasData] = useState(null);

  const { toast } = useToast();
  const navigate = useNavigate();

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
      // UX Gate2Way: mostra o envio e o erro; no mobile, o canvas pode não ter sido montado.
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
        formData.append("estilo", JSON.stringify(canvasData || {}));

        console.log(JSON.stringify(formData))

        const response = await api.post("/projetos", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        toast({
          title: "Projeto criado com sucesso.",
          variant: "success",
        });

        navigate("/projetos");
      } catch (error) {
        toast({ title: "Erro ao criar projeto", description: error.response?.data?.message || "Não foi possível salvar. Tente novamente.", variant: "destructive" });
      } finally {
        submittingRef.current = false;
        setIsSubmitting(false);
      }
    },
    [canvasData, navigate, toast]
  );

  return (
    <MainWrapper title="Novo projeto">
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
                <TabsTrigger value="projectCanvas"><PanelsTopLeftIcon size="20" className="mr-2" />Project canvas</TabsTrigger>
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
          <ProjetosForm ref={projectFormRef} onSubmit={onSubmit} isSubmitting={isSubmitting} />
        </div>
        <div style={{ display: layout === "projectCanvas" ? "block" : "none" }}>
          {isMobile ? (
            <Alert>
              <Monitor className="h-4 w-4" />
              <AlertTitle>Visualização não disponível</AlertTitle>
              <AlertDescription>
                O Project Canvas não pode ser utilizado em dispositivos móveis. 
                Por favor, acesse através de um computador ou tablet para criar e editar o canvas do projeto.
              </AlertDescription>
            </Alert>
          ) : (
            <ProjetosProjectCanvas setCanvasData={setCanvasData} />
          )}
        </div>
      </div>
    </MainWrapper>
  );
};
