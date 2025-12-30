import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { InputChannel } from "@/hooks/useStageMappings";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

  const updateChannel = (id: string, updates: Partial<InputChannel>) => {
    onChange(channels.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const removeChannel = (id: string) => {
    onChange(channels.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Input List (Lista Técnica)</h3>
        <Button onClick={addChannel} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Adicionar Canal
        </Button>
      </div>

      {channels.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
          <p className="text-sm">Nenhum canal adicionado</p>
          <p className="text-xs mt-1">Clique em "Adicionar Canal" para começar</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Canal</TableHead>
                <TableHead>Instrumento / Função</TableHead>
                <TableHead>Tipo de Microfone</TableHead>
                <TableHead className="w-16 text-center">DI</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {channels.map((channel) => (
                <TableRow key={channel.id}>
                  <TableCell>
                    <Input
                      type="number"
                      value={channel.channel}
                      onChange={(e) => updateChannel(channel.id, { channel: parseInt(e.target.value) || 0 })}
                      className="w-14 h-8 text-center"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={channel.instrument}
                      onChange={(e) => updateChannel(channel.id, { instrument: e.target.value })}
                      placeholder="Ex: Voz principal, Violão..."
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={channel.micType}
                      onChange={(e) => updateChannel(channel.id, { micType: e.target.value })}
                      placeholder="Ex: SM58, Beta 52..."
                      className="h-8"
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
                      placeholder="Observações técnicas..."
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeChannel(channel.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
