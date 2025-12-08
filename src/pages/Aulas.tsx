import { Layout } from "@/components/layout/Layout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Clock,
  CheckCircle2,
  Lock,
  BookOpen,
  Trophy,
  Star,
  TrendingUp,
  Mic2,
  DollarSign,
  Users,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  { name: "Marketing Musical", icon: TrendingUp, count: 12, color: "bg-primary" },
  { name: "Vendas para Artistas", icon: DollarSign, count: 8, color: "bg-success" },
  { name: "Gestão de Carreira", icon: Users, count: 10, color: "bg-accent" },
  { name: "Performance no Palco", icon: Mic2, count: 6, color: "bg-warning" },
];

const courses = [
  {
    id: 1,
    title: "Como Fechar 10 Shows por Mês",
    category: "Vendas para Artistas",
    duration: "2h 30min",
    lessons: 12,
    progress: 75,
    thumbnail: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400",
    status: "in-progress",
  },
  {
    id: 2,
    title: "Instagram para Músicos: Guia Completo",
    category: "Marketing Musical",
    duration: "3h 15min",
    lessons: 18,
    progress: 100,
    thumbnail: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400",
    status: "completed",
  },
  {
    id: 3,
    title: "Precificação de Shows",
    category: "Gestão de Carreira",
    duration: "1h 45min",
    lessons: 8,
    progress: 30,
    thumbnail: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400",
    status: "in-progress",
  },
  {
    id: 4,
    title: "Networking no Mercado Musical",
    category: "Gestão de Carreira",
    duration: "2h 00min",
    lessons: 10,
    progress: 0,
    thumbnail: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=400",
    status: "locked",
  },
];

const achievements = [
  { icon: Trophy, title: "Primeiro Curso", description: "Completou seu primeiro curso", unlocked: true },
  { icon: Star, title: "Aluno Dedicado", description: "5 aulas em uma semana", unlocked: true },
  { icon: Target, title: "Meta Batida", description: "100% de progresso em Marketing", unlocked: false },
];

export default function Aulas() {
  return (
    <Layout title="Aulas de Alavancagem" subtitle="Aprenda a crescer sua carreira musical">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">36</p>
              <p className="text-xs text-muted-foreground">Aulas Disponíveis</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">18</p>
              <p className="text-xs text-muted-foreground">Concluídas</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">12h</p>
              <p className="text-xs text-muted-foreground">Tempo Assistido</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">3</p>
              <p className="text-xs text-muted-foreground">Conquistas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Categories */}
          <ChartCard title="Categorias" subtitle="Escolha uma área para estudar">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-all text-left group"
                >
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", cat.color + "/10")}>
                    <cat.icon className={cn("w-5 h-5", cat.color.replace("bg-", "text-"))} />
                  </div>
                  <p className="font-medium text-foreground text-sm">{cat.name}</p>
                  <p className="text-xs text-muted-foreground">{cat.count} aulas</p>
                </button>
              ))}
            </div>
          </ChartCard>

          {/* Courses */}
          <ChartCard title="Meus Cursos" subtitle="Continue de onde parou">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className={cn(
                    "rounded-xl overflow-hidden bg-secondary/50 hover:bg-secondary transition-all group",
                    course.status === "locked" && "opacity-60"
                  )}
                >
                  <div className="relative h-36">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    {course.status === "locked" ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                        <Lock className="w-8 h-8 text-muted-foreground" />
                      </div>
                    ) : (
                      <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                      </button>
                    )}
                    {course.status === "completed" && (
                      <Badge className="absolute top-2 right-2 bg-success text-success-foreground">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Concluído
                      </Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <Badge variant="outline" className="mb-2 text-xs">
                      {course.category}
                    </Badge>
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {course.lessons} aulas
                      </span>
                    </div>
                    {course.status !== "locked" && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="text-primary font-medium">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-1.5" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress */}
          <ChartCard title="Seu Progresso">
            <div className="text-center py-4">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="hsl(var(--muted))"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="url(#progressGrad)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 * (1 - 0.5)}
                  />
                  <defs>
                    <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="hsl(var(--accent))" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-foreground">50%</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">18 de 36 aulas concluídas</p>
            </div>
          </ChartCard>

          {/* Achievements */}
          <ChartCard title="Conquistas">
            <div className="space-y-3">
              {achievements.map((ach, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg",
                    ach.unlocked ? "bg-warning/10" : "bg-secondary/50 opacity-50"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    ach.unlocked ? "bg-warning/20" : "bg-muted"
                  )}>
                    <ach.icon className={cn("w-5 h-5", ach.unlocked ? "text-warning" : "text-muted-foreground")} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{ach.title}</p>
                    <p className="text-xs text-muted-foreground">{ach.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>
    </Layout>
  );
}
