import { Link } from "react-router-dom";
import megafone from "/img/megafone.svg";
import gate2way from "/img/gate2way-logo.png";
import animation from "/animations/lottie-impulsos.json?url";
import frame from "/img/frame.png";
import {
  ArrowRight,
  Mail,
  LayoutPanelTop,
  Building2,
  BookOpenCheck,
  Rocket,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import { Player } from "@lottiefiles/react-lottie-player";
import { Button } from "@/components/ui/button";
import { LogoCarousel } from "@/components/LogoCarousel";

export function Home() {
  const incentives = [
    {
      icon: Building2,
      title: "Infraestrutura",
      description: "Acesso a laboratórios e espaços de pesquisa",
      color: "bg-blue-500",
    },
    {
      icon: BookOpenCheck,
      title: "Bolsa",
      description: "Suporte financeiro para desenvolvimento",
      color: "bg-purple-600",
    },
    {
      icon: Rocket,
      title: "Estágio",
      description: "Oportunidades em empresas parceiras",
      color: "bg-emerald-500",
    },
    {
      icon: Plus,
      title: "Personalizado",
      description: "Impulsos específicos cadastrados por empresas",
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-40 w-full border-b bg-blue-900 backdrop-blur flex justify-center">
        <div className="container flex h-16 items-center mx-3 md:mx-0 space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-6 md:gap-10">
            <Link to="/" className="flex items-center">
              <img src={gate2way} alt="Gate2way Logo" className="w-40 h-auto" />
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center gap-2">
              <Button
                className="border-white text-white text-lg"
                variant="outline"
                asChild
              >
                <Link to="/login">Entrar</Link>
              </Button>
              <Button
                className="border-white text-white hidden"
                variant="outline"
              >
                Começar
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Seção Hero + Carousel */}
        <section className="w-full bg-gradient-to-br from-blue-900/10 via-purple-600/5 to-background relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-20 left-10 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-900/10 rounded-full blur-3xl"></div>
          </div>

          {/* Hero Content */}
          <div className="py-6 md:py-12 lg:py-16 flex justify-center">
            <div className="container px-4 md:px-6 relative z-10 space-y-12">
              <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
                <div className="flex flex-col justify-center space-y-4">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                      <span className="text-blue-900">Conectando talentos a</span>{" "}
                      <span className="text-purple-600">oportunidades reais</span>
                    </h1>
                    <p className="max-w-[600px] text-muted-foreground md:text-xl">
                      A ponte entre o conhecimento acadêmico e os desafios do
                      mercado.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 min-[400px]:flex-row">
                    <Button
                      size="lg"
                      className="bg-blue-900 text-lg hover:bg-blue-900/90"
                      asChild
                    >
                      <Link to="/login">
                        Entrar <ArrowUpRight className="ml-1 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-purple-600 text-lg text-purple-600 hover:bg-purple-600/10"
                      asChild
                    >
                      <a href="#more">Saiba mais</a>
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="relative w-full max-w-[500px] aspect-square">
                    <img
                      src={megafone}
                      alt="Conexão entre academia e empresas"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Carousel - edge to edge */}
          <div className="relative z-10 pb-6 md:pb-12">
            <LogoCarousel />
          </div>
        </section>

        {/* Seção de Features */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background flex justify-center">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-blue-900">
                  Simplificando as{" "}
                  <span className="text-purple-600">conexões</span>
                </h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Acompanhe o progresso, gerencie equipes e entregue resultados
                  com nossa plataforma intuitiva.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="grid gap-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-900 text-white">
                    <LayoutPanelTop className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Canvas do projeto</h3>
                    <p className="text-muted-foreground">
                      Visualize todo o ciclo do projeto em um único lugar.
                      Defina objetivos, marcos e resultados esperados com
                      facilidade.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-600 text-white">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">
                      Notificações automáticas
                    </h3>
                    <p className="text-muted-foreground">
                      Receba atualizações por e-mail sempre que houver mudanças
                      nas etapas do projeto, mantendo todos os envolvidos
                      informados.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-900 text-white">
                    <Rocket className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <h3 className="text-xl font-bold">
                        Acompanhamento de progresso
                      </h3>
                    </div>
                    <p className="text-muted-foreground">
                      Monitore o status dos projetos em andamento.
                    </p>
                  </div>
                </div>
              </div>
              <img src={frame} alt="" className="h-auto w-full" />
            </div>
          </div>
        </section>

        {/* Seção de Impulsos Acadêmicos */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-purple-600/5 via-blue-900/5 to-background relative overflow-hidden flex justify-center">
          {/* Elementos decorativos de fundo */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-20 left-10 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-900/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
          </div>

          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-full bg-gradient-to-r from-purple-600/20 to-blue-900/20 px-4 py-1.5 text-sm font-medium text-purple-600">
                🚀 Impulsos Acadêmicos
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  <span className="text-blue-900">Te levando</span>{" "}
                  <span className="text-purple-600">mais longe</span>
                </h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  O Gate2way incentiva que as empresas parceiras ofereçam
                  impulsos acadêmicos aos talentos que desenvolvem os projetos.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-center">
              {/* Animação Lottie */}
              <div className="flex justify-center order-2 lg:order-1">
                <div className="w-full max-w-md">
                  <Player
                    src={animation}
                    className="w-full h-auto"
                    autoplay
                    loop
                  />
                </div>
              </div>

              {/* Cards de Incentivos */}
              <div className="order-1 lg:order-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {incentives.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={index}
                        className="relative group bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-800 hover:border-purple-600/20 dark:hover:border-purple-600/20 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        <div className="relative z-10">
                          <div
                            className={`mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl ${item.color} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}
                          >
                            <Icon className="h-6 w-6" />
                          </div>
                          <h3 className="text-2xl font-bold mb-2 group-hover:text-purple-600 transition-colors duration-300">
                            {item.title}
                          </h3>
                          <p className="text-muted-foreground">
                            {item.description}
                          </p>
                        </div>

                        <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-purple-600/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-12 justify-center hidden">
              <Button
                size="lg"
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-600/10"
              >
                Saiba mais sobre os impulsos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        <section
          className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-blue-900 to-purple-600 text-white flex justify-center"
          id="more"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="space-y-3 text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center">
                  Onde a inovação empresarial encontra o talento acadêmico
                </h2>
                <p className="max-w-[800px] mx-auto md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-center">
                  Empresas ganham acesso a mentes brilhantes e soluções
                  inovadoras. ICTs (Institutos de Ciência e Tecnologia)
                  proporcionam experiência real e oportunidades de carreira para
                  seus talentos. Uma conexão onde todos saem ganhando.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                  <h3 className="text-xl font-semibold mb-2 text-center">
                    Para Empresas
                  </h3>
                  <p className="mb-4 text-white/80 text-center">
                    Acesse talentos em formação e reduza custos de P&D com
                    projetos inovadores guiados por especialistas acadêmicos.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                  <h3 className="text-xl font-semibold mb-2 text-center">
                    Para ICTs
                  </h3>
                  <p className="mb-4 text-white/80 text-center">
                    Ofereça experiências práticas aos seus talentos e fortaleça
                    parcerias com o setor produtivo através de projetos reais.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t bg-background py-6 md:py-0 flex justify-center">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} Gate2way.
          </p>
        </div>
      </footer>
    </div>
  );
}
