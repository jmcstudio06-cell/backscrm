import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Check,
  Shield,
  HeadphonesIcon,
  XCircle,
  Quote,
  AlertTriangle,
  Briefcase,
  Music,
  Sparkles,
  Lock,
  Target,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppLogo } from "@/components/layout/AppLogo";

const INFINITEPAY_URL =
  "https://loja.infinitepay.io/backstagegroup?categories=1311210-backstage-pro";

const testimonials = [
  {
    name: "Paula Seven",
    role: "Cantora, São Paulo",
    text: "Parei de perder orçamentos e fechei 3x mais shows no primeiro mês.",
  },
  {
    name: "Japa Produções",
    role: "Produtor Musical, Rio de Janeiro",
    text: "Finalmente tenho controle real da minha carreira. É como ter um empresário digital.",
  },
  {
    name: "Banda Trago",
    role: "Banda de Rock, Belo Horizonte",
    text: "A gente achava que era organizado. Depois do Backstage, vimos que não era.",
  },
];

const reassurances = [
  { icon: Shield, text: "Pagamento 100% seguro" },
  { icon: XCircle, text: "Cancele quando quiser" },
  { icon: HeadphonesIcon, text: "Suporte humano real" },
];

const basePlan = {
  name: "Plano Profissional",
  priceNumber: 19.9,
  priceLabel: "R$ 19,90",
  period: "/mês",
  subtitle: "Tudo que você precisa para começar",
  features: [
    "Dashboard completo",
    "Agenda de Shows",
    "Gestão de Clientes",
    "Financeiro básico (Resumo Geral)",
    "Repertório",
    "Tutoriais e Configurações",
  ],
};

type Upgrade = {
  id: string;
  name: string;
  subtitle: string;
  priceNumber: number; // adicional (não inc
