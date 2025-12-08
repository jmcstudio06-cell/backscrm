import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Music,
  ListMusic,
  Play,
  Clock,
  Star,
  MoreVertical,
  Mic2,
  Filter,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const genres = [
  { name: "Todos", count: 156 },
  { name: "Pop", count: 42 },
  { name: "Rock", count: 35 },
  { name: "MPB", count: 28 },
  { name: "Sertanejo", count: 25 },
  { name: "Funk", count: 15 },
  { name: "Internacionais", count: 11 },
];

const songs = [
  { id: 1, title: "Evidências", artist: "Chitãozinho & Xororó", genre: "Sertanejo", key: "G", duration: "4:32", favorite: true },
  { id: 2, title: "Asa Branca", artist: "Luiz Gonzaga", genre: "MPB", key: "D", duration: "3:45", favorite: true },
  { id: 3, title: "Sweet Child O' Mine", artist: "Guns N' Roses", genre: "Rock", key: "D", duration: "5:56", favorite: false },
  { id: 4, title: "Trem Bala", artist: "Ana Vilela", genre: "Pop", key: "C", duration: "4:15", favorite: true },
  { id: 5, title: "Shallow", artist: "Lady Gaga & Bradley Cooper", genre: "Pop", key: "G", duration: "3:37", favorite: false },
  { id: 6, title: "Bohemian Rhapsody", artist: "Queen", genre: "Rock", key: "Bb", duration: "5:55", favorite: true },
  { id: 7, title: "País Tropical", artist: "Jorge Ben Jor", genre: "MPB", key: "A", duration: "3:28", favorite: false },
  { id: 8, title: "Perfect", artist: "Ed Sheeran", genre: "Internacionais", key: "Ab", duration: "4:23", favorite: true },
];

const setlists = [
  { name: "Casamento Clássico", songs: 18, duration: "1h 30min" },
  { name: "Festa Anos 80/90", songs: 22, duration: "1h 45min" },
  { name: "Corporativo Premium", songs: 15, duration: "1h 15min" },
  { name: "Festa Jovem", songs: 25, duration: "2h" },
];

export default function Repertorio() {
  const [selectedGenre, setSelectedGenre] = useState("Todos");

  const filteredSongs = selectedGenre === "Todos" 
    ? songs 
    : songs.filter(s => s.genre === selectedGenre);

  return (
    <Layout title="Repertório" subtitle="Organize suas músicas e setlists">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Music className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">156</p>
              <p className="text-xs text-muted-foreground">Músicas</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <ListMusic className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">12</p>
              <p className="text-xs text-muted-foreground">Setlists</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">45</p>
              <p className="text-xs text-muted-foreground">Favoritas</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">8h 45min</p>
              <p className="text-xs text-muted-foreground">Tempo Total</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Genres */}
          <ChartCard title="Gêneros">
            <div className="space-y-2">
              {genres.map((genre) => (
                <button
                  key={genre.name}
                  onClick={() => setSelectedGenre(genre.name)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-lg transition-all",
                    selectedGenre === genre.name
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-secondary text-foreground"
                  )}
                >
                  <span className="text-sm font-medium">{genre.name}</span>
                  <Badge variant="secondary">{genre.count}</Badge>
                </button>
              ))}
            </div>
          </ChartCard>

          {/* Setlists */}
          <ChartCard title="Setlists">
            <div className="space-y-3">
              {setlists.map((setlist, index) => (
                <button
                  key={index}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <ListMusic className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{setlist.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {setlist.songs} músicas • {setlist.duration}
                    </p>
                  </div>
                </button>
              ))}
              <Button variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Novo Setlist
              </Button>
            </div>
          </ChartCard>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Actions Bar */}
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar músicas..." className="pl-9 w-64 bg-secondary" />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>
            <Button variant="gradient">
              <Plus className="w-4 h-4 mr-2" />
              Nova Música
            </Button>
          </div>

          {/* Songs List */}
          <ChartCard title={`Músicas - ${selectedGenre}`} subtitle={`${filteredSongs.length} músicas encontradas`}>
            <div className="space-y-2">
              {filteredSongs.map((song) => (
                <div
                  key={song.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-all group"
                >
                  <button className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-5 h-5 text-primary ml-0.5" />
                  </button>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:hidden">
                    <Music className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground truncate">{song.title}</h4>
                      {song.favorite && (
                        <Star className="w-4 h-4 text-warning fill-warning shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{song.artist}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {song.genre}
                  </Badge>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground shrink-0">
                    <span className="flex items-center gap-1">
                      <Mic2 className="w-4 h-4" />
                      Tom: {song.key}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {song.duration}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon">
                    <FileText className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>
    </Layout>
  );
}
