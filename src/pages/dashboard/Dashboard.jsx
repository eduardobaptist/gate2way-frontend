import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Users,
  Building2,
  Handshake,
  Rocket,
  Loader2,
  SearchX,
} from "lucide-react";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { toast } from "@/hooks/use-toast";
import { MainWrapper } from "@/components/MainWrapper";
import api from "@/axios";

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await api.get("/dashboard-data");
        setDashboardData(response?.data);
      } catch (error) {
        toast({
          title: error.response?.data?.message || "Erro ao carregar dados",
          variant: "destructive",
        });
        if (error.response?.status === 403) {
          navigate("/projetos");
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <MainWrapper title="Dashboard">
      {loading ? (
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
          <Loader2 className="w-10 h-10 mr-5 text-primary animate-spin" />
          <p className="text-gray-600 text-lg">Carregando dados...</p>
        </div>
      ) : (
        <main className="px-4 sm:px-6">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
            <Link to="/usuarios">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto bg-transparent"
              >
                <Users className="mr-2 h-4 w-4" />
                Gerenciar usuários
              </Button>
            </Link>
            <Link to="/parcerias">
              <Button
                size="sm"
                className="w-full sm:w-auto bg-[#0a2770] text-white hover:bg-[#082056]"
              >
                <Handshake className="mr-2 h-4 w-4" />
                Ver parcerias
              </Button>
            </Link>
          </div>

          <div className="mb-6 grid gap-4 sm:mb-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            <Card className="min-h-[140px] sm:min-h-[160px]">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Projetos cadastrados
                </CardTitle>
                <Rocket className="h-6 w-6" />
              </CardHeader>
              <CardContent className="pt-2">
                <div className="text-4xl font-bold sm:text-5xl text-black">
                  {dashboardData?.cards.totalProjetos || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="min-h-[140px] sm:min-h-[160px]">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Empresas e ICTs cadastradas
                </CardTitle>
                <Building2 className="h-6 w-6" />
              </CardHeader>
              <CardContent className="pt-2">
                <div className="text-4xl font-bold sm:text-5xl text-black">
                  {dashboardData?.cards.organizacoesAtivas || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="min-h-[140px] sm:min-h-[160px]">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Parcerias criadas
                </CardTitle>
                <Handshake className="h-6 w-6" />
              </CardHeader>
              <CardContent className="pt-2">
                <div className="text-4xl font-bold sm:text-5xl text-black">
                  {dashboardData?.cards.parceriasCriadas || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="min-h-[140px] sm:min-h-[160px]">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Visualizações no mês atual
                </CardTitle>
                <Eye className="h-6 w-6" />
              </CardHeader>
              <CardContent className="pt-2">
                <div className="text-4xl font-bold sm:text-5xl text-black">
                  {dashboardData?.cards.visualizacoesMes || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* UX Gate2Way: períodos distintos na API; o gráfico usa a largura do card sem impor proporção fixa. */}
          <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg text-black">
                  Principais projetos por propostas
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Projetos recebendo mais propostas no mês atual
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0 sm:px-6">
                {!dashboardData?.charts.topProjects ||
                dashboardData.charts.topProjects.length === 0 ? (
                  <div className="flex items-center text-slate-600 justify-center gap-2 py-2">
                    <SearchX className="w-5 h-5 mr-2" />
                    <p className="text-md">
                      Nenhuma proposta registrada no mês atual
                    </p>
                  </div>
                ) : (
                  <ChartContainer
                    config={{
                      proposals: {
                        label: "Propostas",
                        color: "#0a2770",
                      },
                    }}
                    className="aspect-auto w-full min-w-0 h-[250px] sm:h-[280px] lg:h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={dashboardData.charts.topProjects}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          type="number"
                          className="text-xs"
                          tick={{ fill: "#475569" }}
                        />
                        <YAxis
                          dataKey="name"
                          type="category"
                          width={100}
                          className="text-xs"
                          tick={{ fill: "#475569" }}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="proposals"
                          fill="#0a2770"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg text-black">
                  Visualizações
                </CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Últimos 7 dias, agrupados por dia da semana
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <p className="mb-3 text-xs text-slate-700">Eixo horizontal: dia da semana. Eixo vertical: quantidade de visualizações.</p>
                {!dashboardData?.charts.projectViews ||
                !dashboardData.charts.projectViews.some((day) => day.views > 0) ? (
                  <div className="flex items-center justify-center py-4">
                    <SearchX className="w-5 h-5 mr-2" />
                    <p className="text-gray-500 text-sm">
                      Sem visualizações nos últimos 7 dias
                    </p>
                  </div>
                ) : (
                  <ChartContainer
                    config={{
                      views: {
                        label: "Visualizações",
                        color: "#8b5cf6",
                      },
                    }}
                    className="aspect-auto w-full min-w-0 h-[250px] sm:h-[280px] lg:h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dashboardData.charts.projectViews}>
                        <defs>
                          <linearGradient
                            id="colorViews"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#8b5cf6"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#8b5cf6"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="day"
                          className="text-xs"
                          tick={{ fill: "#475569" }}
                        />
                        <YAxis allowDecimals={false} className="text-xs" tick={{ fill: "#475569" }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="views"
                          stroke="#8b5cf6"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorViews)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      )}
    </MainWrapper>
  );
}
