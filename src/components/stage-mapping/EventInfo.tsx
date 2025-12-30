import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EventInfoProps {
  artistName: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  technicalContact: string;
  technicalPhone: string;
  onChange: (field: string, value: string) => void;
}

export function EventInfo({
  artistName,
  eventName,
  eventDate,
  eventLocation,
  technicalContact,
  technicalPhone,
  onChange,
}: EventInfoProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Identificação do Evento</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="artistName">Nome do Artista / Banda</Label>
          <Input
            id="artistName"
            value={artistName}
            onChange={(e) => onChange("artist_name", e.target.value)}
            placeholder="Nome do artista ou banda"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="eventName">Nome do Evento</Label>
          <Input
            id="eventName"
            value={eventName}
            onChange={(e) => onChange("event_name", e.target.value)}
            placeholder="Nome do evento"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="eventDate">Data do Show</Label>
          <Input
            id="eventDate"
            type="date"
            value={eventDate}
            onChange={(e) => onChange("event_date", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="eventLocation">Local</Label>
          <Input
            id="eventLocation"
            value={eventLocation}
            onChange={(e) => onChange("event_location", e.target.value)}
            placeholder="Nome do local / Endereço"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="technicalContact">Contato Técnico</Label>
          <Input
            id="technicalContact"
            value={technicalContact}
            onChange={(e) => onChange("technical_contact", e.target.value)}
            placeholder="Nome do responsável técnico"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="technicalPhone">Telefone do Contato</Label>
          <Input
            id="technicalPhone"
            value={technicalPhone}
            onChange={(e) => onChange("technical_phone", e.target.value)}
            placeholder="(00) 00000-0000"
          />
        </div>
      </div>
    </div>
  );
}
