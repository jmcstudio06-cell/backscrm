import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Lightbulb, Loader2 } from "lucide-react";
import { User, Phone, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Improvement {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  completed_at: string | null;
  priority: string;
  created_at: string;
  user_id: string | null;
  user_name: string | null;
  user_phone: string | null;
  user_email: string | null;
}

const PRIORITY_CONFIG = {
  high: { label: "Alta", color: "bg-red-100 text-red-700 border-red-200" },
  medium: { label: "Média", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  low: { label: "Baixa", color: "bg-green-100 text-green-700 border-green-200" },
};

export function ImprovementsPanel() {
  const [improvements, setImprovements] = useState<Improvement[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [adding, setAdding] = useState(false);

  const fetchImprovements = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("improvements")
      .select("*")
      .order("completed", { ascending: true })
      .order("priority", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching improvements:", error);
      toast.error("Erro ao carregar melhorias");
    } else {
      setImprovements(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchImprovements();
  }, []);

  const addImprovement = async () => {
    if (!newTitle.trim()) {
      toast.error("Digite o título da melhoria");
      return;
    }

    setAdding(true);
    const { error } = await supabase
      .from("improvements")
      .insert({
        title: newTitle.trim(),
        description: newDescription.trim() || null,
        priority: newPriority,
      });

    if (error) {
      console.error("Error adding improvement:", error);
      toast.error("Erro ao adicionar melhoria");
    } else {
      toast.success("Melhoria adicionada!");
      setNewTitle("");
      setNewDescription("");
      setNewPriority("medium");
      fetchImprovements();
    }
    setAdding(false);
  };

  const toggleCompleted = async (id: string, completed: boolean) => {
    const { error } = await supabase
      .from("improvements")
      .update({
        completed: !completed,
        completed_at: !completed ? new Date().toISOString() : null,
      })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao atualizar");
    } else {
      setImprovements(prev =>
        prev.map(i =>
          i.id === id
            ? { ...i, completed: !completed, completed_at: !completed ? new Date().toISOString() : null }
            : i
        )
      );
    }
  };

  const deleteImprovement = async (id: string) => {
    const { error } = await supabase.from("improvements").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir");
    } else {
      setImprovements(prev => prev.filter(i => i.id !== id));
      toast.success("Melhoria removida");
    }
  };

  const pending = improvements.filter(i => !i.completed);
  const done = improvements.filter(i => i.completed);

  return (
    <div className="space-y-6">
      {/* Add new improvement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Nova Melhoria
          </CardTitle>
          <CardDescription>Adicione uma melhoria a ser implementada</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Título da melhoria..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <Textarea
            placeholder="Descrição (opcional)..."
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            rows={2}
          />
          <div className="flex items-center gap-3">
            <Label>Prioridade:</Label>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background text-sm"
            >
              <option value="high">Alta</option>
              <option value="medium">Média</option>
              <option value="low">Baixa</option>
            </select>
            <Button onClick={addImprovement} disabled={adding} className="ml-auto">
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Pending */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pendentes ({pending.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {pending.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Nenhuma melhoria pendente 🎉</p>
              ) : (
                <div className="space-y-3">
                  {pending.map(item => (
                    <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                      <Checkbox
                        checked={false}
                        onCheckedChange={() => toggleCompleted(item.id, item.completed)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{item.title}</p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                        )}
                         <div className="flex items-center gap-2 mt-2 flex-wrap">
                           <Badge variant="outline" className={PRIORITY_CONFIG[item.priority as keyof typeof PRIORITY_CONFIG]?.color}>
                             {PRIORITY_CONFIG[item.priority as keyof typeof PRIORITY_CONFIG]?.label}
                           </Badge>
                           <span className="text-xs text-muted-foreground">
                             {new Date(item.created_at).toLocaleDateString("pt-BR")}
                           </span>
                         </div>
                         {item.user_name && (
                           <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                             <span className="flex items-center gap-1">
                               <User className="w-3 h-3" /> {item.user_name}
                             </span>
                             {item.user_phone && (
                               <span className="flex items-center gap-1">
                                 <Phone className="w-3 h-3" /> {item.user_phone}
                               </span>
                             )}
                             {item.user_email && (
                               <span className="flex items-center gap-1">
                                 <Mail className="w-3 h-3" /> {item.user_email}
                               </span>
                             )}
                           </div>
                         )}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteImprovement(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Done */}
          {done.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-green-700">Concluídas ({done.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {done.map(item => (
                    <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg bg-green-50/50">
                      <Checkbox
                        checked={true}
                        onCheckedChange={() => toggleCompleted(item.id, item.completed)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-through text-muted-foreground">{item.title}</p>
                        {item.completed_at && (
                          <p className="text-xs text-green-600 mt-1">
                            Concluída em {new Date(item.completed_at).toLocaleDateString("pt-BR")}
                          </p>
                        )}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteImprovement(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
