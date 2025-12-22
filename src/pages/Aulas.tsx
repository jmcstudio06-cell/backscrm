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
import { useContents } from "@/hooks/useContents";
import { ContentModal } from "@/components/aulas/ContentModal";
import { VideoPlayerModal } from "@/components/aulas/VideoPlayerModal";
import { useAdmin } from "@/hooks/useAdmin";

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

// Extrai o ID do vídeo do YouTube e retorna a URL da thumbnail
function getYouTubeThumbnail(url: string | null): string | null {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
    }
  }
  
  return null;
}

export default function Aulas() {
  const { contents, loading, addContent, deleteContent } = useContents();
  const { isAdmin } = useAdmin();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{ url: string | null; title: string } | null>(null);

  const handleSaveContent = async (data: {
    title: string;
    description: string;
    url: string;
    category: string;
    type: string;
    featured: boolean;
    thumbnail: string;
  }) => {
    await addContent(data);
  };

  const handleDeleteContent = async (id: string) => {
    await deleteContent(id);
  };

  const handleOpenLink = (url: string | null) => {
    if (url) {
      window.open(url, "_blank");
    }
  };

  const handlePlayVideo = (url: string | null, title: string) => {
    setSelectedVideo({ url, title });
    setVideoPlayerOpen(true);
  };

  // Retorna a thumbnail: primeiro tenta a custom, depois extrai do YouTube
  const getThumbnail = (customThumbnail: string | null, videoUrl: string | null): string | null => {
    if (customThumbnail) return customThumbnail;
    return getYouTubeThumbnail(videoUrl);
  };

  const filteredContents = selectedCategory === "all" 
    ? contents 
    : contents.filter(c => c.category === selectedCategory);

  const featuredContents = filteredContents.filter(c => c.featured);
  const linkContents = filteredContents.filter(c => c.type === "link" && !c.featured);
  const videoContents = filteredContents.filter(c => c.type === "video" && !c.featured);

  if (loading) {
    return (
      <Layout title="" subtitle="">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="" subtitle="">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-6 md:mb-8 bg-gradient-to-r from-primary via-blue-500 to-cyan-400 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
              <Lightbulb className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-white">Apoio e Conhecimentos</h1>
              <p className="text-white/80 text-sm md:text-base">Ideias produtivas, dicas e conteúdos úteis</p>
            </div>
          </div>
          {isAdmin && (
            <Button 
              variant="outline" 
              className="bg-white text-primary hover:bg-white/90 border-none w-full md:w-auto"
              onClick={() => setModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Conteúdo
            </Button>
          )}
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-6 md:mb-8 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "shrink-0 text-xs md:text-sm",
              selectedCategory === cat.id 
                ? "bg-primary text-primary-foreground" 
                : "bg-card hover:bg-muted"
            )}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Empty State */}
      {filteredContents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Lightbulb className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhum conteúdo adicionado</p>
          <p className="text-sm text-muted-foreground mb-4">
            {isAdmin 
              ? "Adicione links, vídeos e outros materiais para organizar seu aprendizado"
              : "Aguarde o administrador adicionar conteúdos"
            }
          </p>
          {isAdmin && (
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Conteúdo
            </Button>
          )}
        </div>
      )}

      {/* Featured Section */}
      {featuredContents.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-foreground">Em Destaque</h2>
          </div>

          {featuredContents.map((item) => {
            const thumbnail = getThumbnail(item.thumbnail, item.url);
            
            return (
              <div 
                key={item.id}
                className="bg-card rounded-xl border border-border overflow-hidden mb-4"
              >
                <div className="bg-orange-500 text-white px-4 py-2 text-sm font-medium flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  EM DESTAQUE
                </div>
                <div className="flex flex-col md:flex-row">
                  {item.type === "video" && thumbnail && (
                    <div 
                      className="relative w-full md:w-64 aspect-video md:aspect-auto md:h-32 cursor-pointer group shrink-0"
                      onClick={() => handlePlayVideo(item.url, item.title)}
                    >
                      <img 
                        src={thumbnail} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
                          <Play className="w-6 h-6 text-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="p-4 flex items-center justify-between flex-1">
                    <div 
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => item.type === "video" ? handlePlayVideo(item.url, item.title) : handleOpenLink(item.url)}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        item.type === "video" ? "bg-red-100" : "bg-primary/10"
                      )}>
                        {item.type === "video" ? (
                          <Play className="w-5 h-5 text-red-500" />
                        ) : (
                          <ExternalLink className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.category.toUpperCase()}</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteContent(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Content Cards */}
      {linkContents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
          {linkContents.map((item) => (
            <div 
              key={item.id}
              className="bg-card rounded-xl border border-border p-3 md:p-4"
            >
              <div className="flex items-start justify-between mb-2 md:mb-3">
                <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <ExternalLink className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground text-xs md:text-sm truncate">{item.title}</h3>
                    <Badge variant="outline" className="mt-1 text-[10px] md:text-xs">{item.category.toUpperCase()}</Badge>
                  </div>
                </div>
                {isAdmin && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7 md:h-8 md:w-8 shrink-0"
                    onClick={() => handleDeleteContent(item.id)}
                  >
                    <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                )}
              </div>
              {item.description && (
                <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4 line-clamp-2">{item.description}</p>
              )}
              <Button 
                variant="outline" 
                className="w-full text-xs md:text-sm h-8 md:h-9"
                onClick={() => handleOpenLink(item.url)}
              >
                <ExternalLink className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                Acessar Link
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Video Content */}
      {videoContents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videoContents.map((video) => {
            const thumbnail = getThumbnail(video.thumbnail, video.url);
            
            return (
              <div 
                key={video.id}
                className="bg-card rounded-xl border border-border overflow-hidden group"
              >
                <div 
                  className="relative aspect-video cursor-pointer"
                  onClick={() => handlePlayVideo(video.url, video.title)}
                >
                  {thumbnail ? (
                    <img 
                      src={thumbnail} 
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Play className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>
                  <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                    {video.category.toUpperCase()}
                  </Badge>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <h3 className="font-semibold text-foreground line-clamp-2 flex-1">{video.title}</h3>
                  {isAdmin && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 shrink-0 ml-2"
                      onClick={() => handleDeleteContent(video.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ContentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSaveContent}
      />

      <VideoPlayerModal
        open={videoPlayerOpen}
        onOpenChange={setVideoPlayerOpen}
        videoUrl={selectedVideo?.url || null}
        title={selectedVideo?.title || ""}
      />
    </Layout>
  );
}
