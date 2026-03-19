import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Calendar, MapPin, Phone, FileText, Contact } from "lucide-react";

interface EventInfoProps {
  artistName: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  technicalContact: string;
  technicalPhone: string;
  onChange: (field: string, value: string) => void;
}

const FIELDS = [
  { id: "artistName", field: "artist_name", label: "Nome do Artista / Banda", icon: User, placeholder: "Nome do artista ou banda", type: "text" },
  { id: "eventName", field: "event_name", label: "Nome do Evento", icon: FileText, placeholder: "Nome do evento", type: "text" },
  { id: "eventDate", field: "event_date", label: "Data do Show", icon: Calendar, placeholder: "", type: "date" },
  { id: "eventLocation", field: "event_location", label: "Local", icon: MapPin, placeholder: "Nome do local / Endereço", type: "text" },
  { id: "technicalContact", field: "technical_contact", label: "Contato Técnico", icon: Contact, placeholder: "Nome do responsável técnico", type: "text" },
  { id: "technicalPhone", field: "technical_phone", label: "Telefone do Contato", icon: Phone, placeholder: "(00) 00000-0000", type: "text" },
] as const;

export function EventInfo({
  artistName,
  eventName,
  eventDate,
  eventLocation,
  technicalContact,
  technicalPhone,
  onChange,
}: EventInfoProps) {
  const values: Record<string, string> = {
    artistName: artistName,
    eventName: eventName,
    eventDate: eventDate,
    eventLocation: eventLocation,
    technicalContact: technicalContact,
    technicalPhone: technicalPhone,
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Identificação do Evento</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FIELDS.map(({ id, field, label, icon: Icon, placeholder, type }) => (
          <div key={id} className="space-y-2">
            <Label htmlFor={id} className="flex items-center gap-2 text-sm">
              <Icon className="w-3.5 h-3.5 text-muted-foreground" />
              {label}
            </Label>
            <Input
              id={id}
              type={type}
              value={values[id]}
              onChange={(e) => onChange(field, e.target.value)}
              placeholder={placeholder}
              className="h-9"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
