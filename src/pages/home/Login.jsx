import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  PopcornIcon,
  InfoIcon,
  Sparkle,
  Sparkles,
  Info,
  CheckCircle2Icon,
  AlertCircleIcon,
  UserRoundPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/axios";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "E-mail é obrigatório" })
    .email({ message: "E-mail inválido" }),
  senha: z.string().min(1, { message: "Senha é obrigatória" }),
});

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      senha: "",
    },
  });

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (data) => {
    setIsLoading(true);

    login(data)
      .then(({ success, user, error }) => {
        if (success) {
          if (user?.tipo === "admin") {
            navigate("/dashboard");
          } else {
            navigate("/projetos");
          }
        } else {
          toast({
            variant: "destructive",
            title: "Erro ao fazer login",
            description: error.response?.data?.message || "",
          });
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-white relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-900/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl"></div>
      </div>

      <main className="flex-1 flex items-center justify-center p-4 md:p-8 z-10">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
          <CardHeader className="space-y-1 text-start">
            <div className="flex justify-start mb-4">
              <Link
                to="/"
                className="inline-flex items-center text-blue-900 hover:text-blue-800 transition-colors text-md"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                <span>Voltar à página inicial</span>
              </Link>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-blue-900">
              Entrar no Gate2way
            </CardTitle>
            <CardDescription className="text-gray-500">
              Digite suas credenciais abaixo
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4 mb-3"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">E-mail</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            type="email"
                            className="bg-white border-slate-200 focus:border-purple-600 focus:ring-purple-600"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="senha"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-gray-700">Senha</FormLabel>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            className="pr-10 bg-white border-slate-200 focus:border-purple-600 focus:ring-purple-600"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            aria-label={
                              showPassword ? "Esconder senha" : "Mostrar senha"
                            }
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Carregando...
                    </>
                  ) : (
                    "Confirmar"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
