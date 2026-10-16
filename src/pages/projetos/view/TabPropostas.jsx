import { OrganizationLogo } from "@/components/OrganizationLogo";
import { useState, useMemo } from "react";
import { CheckCircle, XCircle, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Field } from "@/components/Field";
import { toast } from "@/hooks/use-toast";
import { formatDatetime } from "@/lib/utils";
import api from "@/axios";

export const TabPropostas = ({ projeto, onRefresh }) => {
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedInteresse, setSelectedInteresse] = useState(null);

  const allInteresses = useMemo(() => {
    if (!projeto?.Oferta?.length) return [];

    return projeto.Oferta.reduce((acc, oferta) => {
      if (oferta.interesses?.length) {
        return [...acc, ...oferta.interesses];
      }
      return acc;
    }, []);
  }, [projeto]);

  const categorizedInteresses = useMemo(() => {
    const pendentes = allInteresses.filter(
      (interesse) => interesse.status === "pendente"
    );
    const aprovadas = allInteresses.filter(
      (interesse) => interesse.status === "aceito"
    );
    const naoAprovadas = allInteresses.filter(
      (interesse) =>
        interesse.status === "rejeitada" || interesse.status === "rejeitado"
    );

    return { pendentes, aprovadas, naoAprovadas };
  }, [allInteresses]);

  const handleApprove = async (id) => {
    try {
      await api.post("/parcerias", {
        interesse_id: id,
      });

      toast({
        title: `Proposta aprovada com sucesso`,
        variant: "success",
      });

      onRefresh();
    } catch (error) {
      toast({
        title: "Erro ao aprovar proposta",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`/interesses/rejeitar/${id}`);

      toast({
        title: `Proposta rejeitada com sucesso`,
        variant: "success",
      });

      onRefresh();
    } catch (error) {
      toast({
        title: "Erro ao rejeitar proposta",
        variant: "destructive",
      });
    }
  };

  const InteresseItem = ({ interesse, showActions = false }) => {
    const usuario = interesse.Usuario;
    const ict = usuario?.Responsavels?.[0]?.Ict;

    return (
      <div className="border border-gray-100 rounded-lg p-6 bg-white shadow-sm hover:shadow-lg hover:border-gray-200">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
            <OrganizationLogo src={ict?.foto_perfil ? `${import.meta.env.VITE_API_URL}${ict.foto_perfil}` : null} name={ict?.nome} icon={GraduationCap} className="h-12 w-12 rounded-full border p-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {ict?.nome}
              </h3>
            </div>
          </div>

          {interesse.proposta && (
            <div>
              <Field label="Proposta" value={interesse.proposta} />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Enviado por"
              value={`${usuario?.nome} (${usuario?.email})`}
            />
            <Field
              label="Submetido em"
              value={formatDatetime(interesse.createdAt)}
            />
          </div>

          {showActions && (
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
              <Button
                onClick={() => {
                  setSelectedInteresse(interesse.id);
                  setIsApproveDialogOpen(true);
                  setIsRejectDialogOpen(false);
                }}
                className="text-black hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 flex-1"
                variant="outline"
              >
                <CheckCircle className="mr-2 text-emerald-600" size="16" />
                Aprovar Proposta
              </Button>
              <Button
                onClick={() => {
                  setSelectedInteresse(interesse.id);
                  setIsApproveDialogOpen(false);
                  setIsRejectDialogOpen(true);
                }}
                className="text-black hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 flex-1"
                variant="outline"
              >
                <XCircle className="mr-2 text-rose-600" size="16" />
                Rejeitar Proposta
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground">
          Propostas por status
        </h2>
        <p className="text-sm text-muted-foreground mt-0">
          Propostas pendentes possuem ação de aprovar e rejeitar
        </p>
      </div>
      <div className="animate-in fade-in-50 duration-500">
        <div className="space-y-6">
          <Accordion type="multiple" className="w-full space-y-4">
            <AccordionItem
              value="propostas-pendentes"
              className="border border-amber-200/60 rounded-lg shadow-sm overflow-hidden hover:shadow-md hover:border-amber-300/70"
            >
              <AccordionTrigger className="px-6 py-5 hover:no-underline bg-gradient-to-br from-amber-50/80 via-yellow-50/60 to-orange-50/80 hover:from-amber-100/80 hover:via-yellow-100/70 hover:to-orange-100/80">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-lg">
                    {categorizedInteresses.pendentes.length}
                  </Badge>
                  <div className="text-left">
                    <span className="font-semibold text-amber-800  text-lg">
                      Propostas pendentes
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="pt-4">
                  {categorizedInteresses.pendentes.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-lg">
                        Nenhuma proposta pendente
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {categorizedInteresses.pendentes.map((interesse) => (
                        <InteresseItem
                          key={interesse.id}
                          interesse={interesse}
                          showActions={true}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="propostas-aprovadas"
              className="border border-emerald-200/60 rounded-lg shadow-sm overflow-hidden hover:shadow-md hover:border-emerald-300/70"
            >
              <AccordionTrigger className="px-6 py-5 hover:no-underline bg-gradient-to-br from-emerald-50/80 via-emerald-50/60 to-teal-50/80 hover:from-emerald-100/80 hover:via-emerald-100/70 hover:to-teal-100/80">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-lg">
                    {categorizedInteresses.aprovadas.length}
                  </Badge>
                  <div className="text-left">
                    <span className="font-semibold text-emerald-800  text-lg">
                      Propostas aprovadas
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="pt-4">
                  {categorizedInteresses.aprovadas.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-lg">
                        Nenhuma proposta aprovada ainda
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {categorizedInteresses.aprovadas.map((interesse) => (
                        <InteresseItem
                          key={interesse.id}
                          interesse={interesse}
                          showActions={false}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="propostas-rejeitadas"
              className="border border-rose-200/60 rounded-lg shadow-sm overflow-hidden hover:shadow-md hover:border-rose-300/70"
            >
              <AccordionTrigger className="px-6 py-5 hover:no-underline bg-gradient-to-br from-rose-50/80 via-rose-50/60 to-pink-50/80 hover:from-rose-100/80 hover:via-rose-100/70 hover:to-pink-100/80">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-lg">
                    {categorizedInteresses.naoAprovadas.length}
                  </Badge>
                  <div className="text-left">
                    <span className="font-semibold text-rose-800 text-lg">
                      Propostas não aprovadas
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="pt-4">
                  {categorizedInteresses.naoAprovadas.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-lg">
                        Nenhuma proposta rejeitada
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {categorizedInteresses.naoAprovadas.map((interesse) => (
                        <InteresseItem
                          key={interesse.id}
                          interesse={interesse}
                          showActions={false}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <AlertDialog
        open={isApproveDialogOpen}
        onOpenChange={setIsApproveDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Tem certeza que deseja aprovar essa proposta?
            </AlertDialogTitle>
            <AlertDialogDescription>
              As demais propostas para este projeto serão 
              automaticamente rejeitadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => handleApprove(selectedInteresse)}
              className="bg-green-600 hover:bg-green-700 focus:ring-green-600"
            >
              Aprovar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Tem certeza que deseja rejeitar essa proposta?
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => handleReject(selectedInteresse)}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Rejeitar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};
