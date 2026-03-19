import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, GripVertical, ArrowUp, ArrowDown, Copy } from "lucide-react";
import { InputChannel } from "@/hooks/useStageMappings";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface InputListProps {
  channels: InputChannel[];
  onChange: (channels: InputChannel[]) => void;
}

export function InputList({ channels, onChange }: InputListProps) {
  const addChannel = () => {
    const nextChannel = channels.length > 0 
      ? Math.max(...channels.map(c => c.channel)) + 1 
      : 1;
    
    const newChannel: InputChannel = {
      id: crypto.randomUUID(),
      channel: nextChannel,
      instrument: "",
      micType: "",
      di: false,
      observations: "",
    };
    
    onChange([...channels, newChannel]);
  };

  const duplicateChannel = (ch: InputChannel) => {
    const nextChannel = channels.length > 0 
      ? Math.max(...channels.map(c => c.channel)) + 1 
      : 1;
    const newChannel: InputChannel = {
      ...ch,
      id: crypto.randomUUID(),
      channel: nextChannel,
    };
    const idx = channels.findIndex(c => c.id === ch.id);
    const newChannels = [...channels];
    newChannels.splice(idx + 1, 0, newChannel);
    // Renumber
    onChange(newChannels.map((c, i) => ({ ...c, channel: i + 1 })));
  };

  const updateChannel = (id: string, updates: Partial<InputChannel>) => {
    onChange(channels.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const removeChannel = (id: string) => {
    const remaining = channels.filter(c => c.id !== id);
    // Auto-renumber
    onChange(remaining.map((c, i) => ({ ...c, channel: i + 1 })));
  };

  const moveChannel = (id: string, direction: 'up' | 'down') => {
    const idx = channels.findIndex(c => c.id === id);
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === channels.length - 1)) return;
    const newChannels = [...channels];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    [newChannels[idx], newChannels[swapIdx]] = [newChannels[swapIdx], newChannels[idx]];
    onChange(newChannels.map((c, i) => ({ ...c, channel: i + 1 })));
  };

  const totalDI = channels.filter(c => c.di).length;
  const totalMics = channels.filter(c => c.micType && !c.di).length;

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-medium">Input List</h3>
            {channels.length > 0 && (
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-xs">
                  {channels.length} canais
                </Badge>
                {totalMics > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {totalMics} mics
                  </Badge>
                )}
                {totalDI > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {totalDI} DI
                  </Badge>
                )}
              </div>
            )}
          </div>
          <Button onClick={addChannel} size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            Adicionar Canal
          </Button>
        </div>

        {channels.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-xl border-dashed bg-muted/30">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Plus className="w-6 h-6 text-primary/50" />
            </div>
            <p className="text-sm font-medium">Nenhum canal adicionado</p>
            <p className="text-xs mt-1 text-muted-foreground/70">Adicione elementos no palco ou clique em "Adicionar Canal"</p>
          </div>
        ) : (
          <div className="border rounded-xl overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-10"></TableHead>
                  <TableHead className="w-16 text-center font-semibold">CH</TableHead>
                  <TableHead className="font-semibold">Instrumento / Função</TableHead>
                  <TableHead className="font-semibold">Microfone</TableHead>
                  <TableHead className="w-14 text-center font-semibold">DI</TableHead>
                  <TableHead className="font-semibold">Observações</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {channels.map((channel, index) => (
                  <TableRow key={channel.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell className="px-1">
                      <div className="flex flex-col items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => moveChannel(channel.id, 'up')}
                          disabled={index === 0}
                          className="p-0.5 rounded hover:bg-muted disabled:opacity-20"
                        >
                          <ArrowUp className="w-3 h-3 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => moveChannel(channel.id, 'down')}
                          disabled={index === channels.length - 1}
                          className="p-0.5 rounded hover:bg-muted disabled:opacity-20"
                        >
                          <ArrowDown className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="w-10 h-8 rounded-md bg-zinc-900 text-white flex items-center justify-center text-sm font-bold mx-auto">
                        {channel.channel}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={channel.instrument}
                        onChange={(e) => updateChannel(channel.id, { instrument: e.target.value })}
                        placeholder="Ex: Voz principal, Violão..."
                        className="h-8 text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={channel.micType}
                        onChange={(e) => updateChannel(channel.id, { micType: e.target.value })}
                        placeholder="Ex: SM58, Beta 52..."
                        className="h-8 text-sm"
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={channel.di}
                        onCheckedChange={(checked) => updateChannel(channel.id, { di: !!checked })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={channel.observations}
                        onChange={(e) => updateChannel(channel.id, { observations: e.target.value })}
                        placeholder="Obs..."
                        className="h-8 text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => duplicateChannel(channel)} className="h-7 w-7">
                              <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Duplicar canal</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => removeChannel(channel.id)} className="h-7 w-7 text-destructive hover:text-destructive">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Remover canal</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
