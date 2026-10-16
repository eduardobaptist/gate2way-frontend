import { useState, useRef, useEffect, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "@/axios";
import { CANVAS_FIELDS, inspectCanvas, reconcileCanvasResponse, readyForProject, assertLoadedProject, recordText, buildProjectPayload, projectSaveError } from "@/lib/projetoCanvas";
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
  const [, setCanvasData] = useState(null);
  const [canvasSnapshot, setCanvasSnapshot] = useState(null);
  const snapshotRef = useRef(null);
  const changesRef = useRef(new Map());
  const latestTextsRef = useRef({});
  const fieldVersionsRef = useRef(new Map());
  const inputVersionRef = useRef(0);
  const editorIdRef = useRef(null);
  const [reconciliationRequired, setReconciliationRequired] = useState(false);
  const routeIdRef = useRef(id);
  routeIdRef.current = id;
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [projectData, setProjectData] = useState(null);
  const projectFormRef = useRef(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    snapshotRef.current = null;
    changesRef.current = new Map();
    latestTextsRef.current = {};
    fieldVersionsRef.current = new Map();
    inputVersionRef.current = 0;
    editorIdRef.current = null;
    setReconciliationRequired(false);
    setCanvasSnapshot(null);
    setProjectData(null);
    setLoadError("");
    setSaveError("");
    const fetchProject = async () => {
      setIsLoading(true);

      try {
        const response = await api.get(`/projetos/${id}`, { signal: controller.signal });
        if (!active || String(routeIdRef.current) !== String(id)) return;
        assertLoadedProject(response.data, id);
        const snapshot = inspectCanvas(response.data);
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

        snapshotRef.current = snapshot;
        latestTextsRef.current = { ...snapshot.texts };
        editorIdRef.current = String(id);
        setCanvasSnapshot(snapshot);
        setProjectData(data);
      } catch (error) {
        if (active && !controller.signal.aborted) {
          snapshotRef.current = null;
          setLoadError(error.message || "Não foi possível carregar o projeto. Recarregue a página para tentar novamente.");
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchProject();
    return () => { active = false; controller.abort(); };
  }, [id]);

  const projectReady = !isLoading && !!projectData && readyForProject(canvasSnapshot, id);
  const canSave = projectReady && !reconciliationRequired;
  const getCurrentText = useCallback(key => latestTextsRef.current[key], []);
  const handleTextChange = useCallback((key, value) => {
    const snapshot = snapshotRef.current;
    if (editorIdRef.current !== String(routeIdRef.current) || !CANVAS_FIELDS.includes(key) || typeof value !== "string") return;
    latestTextsRef.current = { ...latestTextsRef.current, [key]: value };
    fieldVersionsRef.current.set(key, ++inputVersionRef.current);
    try {
      if (snapshot) changesRef.current = recordText(snapshot, changesRef.current, key, value);
    } catch (error) {
      setSaveError(error.message);
    }
  }, []);

  const handleSave = useCallback(() => {
    if (canSave && !isSubmitting && !submittingRef.current && projectFormRef.current) {
      projectFormRef.current.requestSubmit();
    }
  }, [canSave, isSubmitting]);

  const onSubmit = useCallback(
    async (formData) => {
      if (submittingRef.current) return;
      if (!canSave || !readyForProject(snapshotRef.current, routeIdRef.current) || String(id) !== String(routeIdRef.current)) {
        setSaveError("Aguarde o carregamento completo do projeto correto antes de salvar.");
        return;
      }
      submittingRef.current = true;
      setIsSubmitting(true);
      setSaveError("");
      try {
        const submittedChanges = changesRef.current;
        const submittedVersion = inputVersionRef.current;
        const previousSnapshot = snapshotRef.current;
        const payload = buildProjectPayload(formData, snapshotRef.current, submittedChanges, id);
        const response = await api.put(`/projetos/${id}`, payload, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (String(routeIdRef.current) !== String(id)) return;
        const editedAfterRequest = new Set([...fieldVersionsRef.current]
          .filter(([, version]) => version > submittedVersion).map(([key]) => key));
        let reconciled;
        try {
          reconciled = reconcileCanvasResponse(response.data, previousSnapshot, submittedChanges,
            latestTextsRef.current, editedAfterRequest, id);
        } catch (error) {
          snapshotRef.current = null;
          setReconciliationRequired(true);
          setSaveError(error.message);
          return;
        }
        snapshotRef.current = reconciled.snapshot;
        latestTextsRef.current = reconciled.texts;
        changesRef.current = reconciled.changes;
        setCanvasSnapshot(reconciled.snapshot);
        if (editedAfterRequest.size) {
          setSaveError("O envio foi confirmado. Os novos textos digitados durante a operação foram mantidos e comparados com a revisão salva; salve novamente para gravar as alterações pendentes.");
          return;
        }
        toast({
          title: "Projeto atualizado com sucesso.",
          variant: "success",
        });

        navigate("/projetos");
      } catch (error) {
        if (String(routeIdRef.current) !== String(id)) return;
        if (!error.response || [409, 428].includes(error.response.status) || error.response.data?.code === "PROJECT_COMMIT_UNKNOWN") {
          snapshotRef.current = null;
          setReconciliationRequired(true);
        }
        const errorMessage = projectSaveError(error);
        setSaveError(errorMessage);

        toast({
          title: errorMessage,
          variant: "destructive",
        });
      } finally {
        submittingRef.current = false;
        setIsSubmitting(false);
      }
    },
    [canSave, id, navigate, toast]
  );

  return (
    <MainWrapper title="Editar projeto" contentClassName={layout === "infosGerais" ? "mx-auto max-w-4xl" : undefined}>
      {isMobile ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
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
              className="bg-green-700 text-white font-bold hover:text-white hover:bg-green-800"
              variant="outline"
              onClick={handleSave}
              disabled={isSubmitting || !canSave}
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
                <TabsTrigger value="projectCanvas">Canvas do projeto</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-3">
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
            className="bg-green-700 text-white font-bold hover:text-white hover:bg-green-800"
            variant="outline"
            onClick={handleSave}
            disabled={isSubmitting || !canSave}
          >
            <CheckCircleIcon className="mr-2" size="20" />
            {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
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
                  Canvas do projeto
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

        </div>
      )}
      {loadError && <Alert role="alert"><AlertTitle>Projeto não carregado</AlertTitle><AlertDescription>{loadError}</AlertDescription></Alert>}
      {saveError && <Alert role="alert"><AlertTitle>Atualização não confirmada</AlertTitle><AlertDescription>{saveError}</AlertDescription></Alert>}
      <div className="mt-5">
        {isLoading && <p role="status">Carregando projeto...</p>}
        <div style={{ display: layout === "infosGerais" ? "block" : "none" }}>
          {projectReady && <ProjetosForm
            key={String(canvasSnapshot.raw.id)}
            ref={projectFormRef}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            formData={projectData}
          />}
        </div>
        <div style={{ display: layout === "projectCanvas" ? "block" : "none" }}>
          {isMobile ? (
            <Alert>
              <Monitor className="h-4 w-4" />
              <AlertTitle>Edição não disponível</AlertTitle>
              <AlertDescription>
                O Canvas do projeto não pode ser editado em dispositivos móveis.
                Por favor, acesse através de um computador ou tablet para editar o canvas do projeto.
              </AlertDescription>
            </Alert>
          ) : (
            projectReady && (canvasSnapshot.editable ? (
              <ProjetosProjectCanvas
                key={String(canvasSnapshot.raw.id)}
                setCanvasData={setCanvasData}
                initialData={canvasSnapshot.display}
                onTextChange={handleTextChange}
                getCurrentText={getCurrentText}
              />
            ) : (
              <Alert role="status"><AlertTitle>Canvas preservado</AlertTitle><AlertDescription>{canvasSnapshot.reason}</AlertDescription></Alert>
            ))
          )}
        </div>
      </div>
    </MainWrapper>
  );
};
