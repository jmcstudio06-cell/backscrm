import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Lightbulb,
  Play,
  ExternalLink,
  Trash2,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  { id: "all", name: "Todas" },
  { id: "marketing", name: "MARKETING" },
  { id: "producao", name: "PRODUÇÃO" },
  { id: "financeiro", name: "FINANCEIRO" },
  { id: "networking", name: "NETWORKING" },
  { id: "carreira", name: "CARREIRA" },
  { id: "tecnica", name: "TÉCNICA MUSICAL" },
  { id: "vendas", name: "VENDAS" },
  { id: "ferramentas", name: "FERRAMENTAS" },
  { id: "outra", name: "OUTRA" },
];

const featuredContent = [
  {
    id: 1,
    title: "PODCAST VENÇACAST",
    category: "MARKETING",
    type: "video",
    featured: true,
  },
];

const contentItems = [
  {
    id: 2,
    title: "Arte réveillon (Editável no canva grátis)",
    category: "MARKETING",
    description: "Só abrir no canva e trocar o conteúdo, fácil e prático!",
    type: "link",
  },
  {
    id: 3,
    title: "Arte Agenda (Editável no canva)",
    category: "MARKETING",
    description: "Só abrir no canva e trocar o conteúdo, fácil e prático!",
    type: "link",
  },
  {
    id: 4,
    title: "Arte (Reveillon Editável no Canva)",
    category: "MARKETING",
    type: "link",
  },
];

const videoContent = [
  {
    id: 5,
    title: "COMO TRABALHAR O CRM NO SE...",
    thumbnail: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400",
    category: "VENDAS",
  },
  {
    id: 6,
    title: "O MAIOR ERRO que impede CANT...",
    thumbnail: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400",
    category: "CARREIRA",
  },
  {
    id: 7,
    title: "O Segredo para Aumentar o Valor...",
    thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
    category: "FINANCEIRO",
  },
];

export default function Aulas() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  return (
    <Layout title="" subtitle="">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-primary via-blue-500 to-cyan-400 p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Lightbulb className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Aulas de alavancagem</h1>
              <p className="text-white/80">Ideias produtivas, dicas e conteúdos úteis</p>
            </div>
          </div>
          <Button variant="outline" className="bg-white text-primary hover:bg-white/90 border-none">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Conteúdo
          </Button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              selectedCategory === cat.id 
                ? "bg-primary text-primary-foreground" 
                : "bg-card hover:bg-muted"
            )}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Featured Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-semibold text-foreground">Em Destaque</h2>
        </div>

        {featuredContent.map((item) => (
          <div 
            key={item.id}
            className="bg-card rounded-xl border border-border overflow-hidden"
          >
            <div className="bg-orange-500 text-white px-4 py-2 text-sm font-medium flex items-center gap-2">
              <Star className="w-4 h-4" />
              EM DESTAQUE
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <Play className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Content Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {contentItems.map((item) => (
          <div 
            key={item.id}
            className="bg-card rounded-xl border border-border p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ExternalLink className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                  <Badge variant="outline" className="mt-1 text-xs">{item.category}</Badge>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            {item.description && (
              <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
            )}
            <Button variant="outline" className="w-full">
              <ExternalLink className="w-4 h-4 mr-2" />
              Acessar Link
            </Button>
          </div>
        ))}
      </div>

      {/* Video Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videoContent.map((video) => (
          <div 
            key={video.id}
            className="bg-card rounded-xl border border-border overflow-hidden group cursor-pointer hover:shadow-lg transition-all"
          >
            <div className="relative aspect-video">
              <img 
                src={video.thumbnail} 
                alt={video.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
              <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                {video.category}
              </Badge>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-foreground line-clamp-2">{video.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
