import * as React from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  BookOpenCheck,
  Check,
  CheckCircle2,
  Copy,
  Loader2,
  Megaphone,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { marketingApi } from "@/api/marketing";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast-provider";
import { cn } from "@/lib/utils";
import type {
  CampaignBrief,
  CampaignObjective,
  MarketingCampaign,
  MarketingChannel,
  MarketingStatus,
  OfferFocus,
} from "@/types/marketing";

const DEFAULT_CTA =
  "Consulta la información vigente y solicita tu reservación en el portal oficial.";

const OBJECTIVES: Array<{ value: CampaignObjective; label: string }> = [
  { value: "atraer_visitas", label: "Atraer visitas" },
  { value: "impulsar_reservas", label: "Impulsar reservaciones" },
  { value: "llenar_hospedaje", label: "Promover hospedaje" },
  { value: "promover_camping", label: "Promover camping" },
  { value: "informar", label: "Informar" },
  { value: "reactivar_clientes", label: "Invitar a regresar" },
];

const FOCUSES: Array<{ value: OfferFocus; label: string }> = [
  { value: "experiencia_general", label: "Experiencia general" },
  { value: "entrada", label: "Visita de día" },
  { value: "camping", label: "Camping" },
  { value: "hospedaje", label: "Hospedaje" },
];

const CHANNELS: Array<{ value: MarketingChannel; label: string }> = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "instagram_story", label: "Historia de Instagram" },
  { value: "whatsapp_status", label: "Estado de WhatsApp" },
  { value: "google_business", label: "Google Business" },
];

const CHANNEL_LABELS = Object.fromEntries(
  CHANNELS.map((channel) => [channel.value, channel.label])
) as Record<MarketingChannel, string>;

const INITIAL_BRIEF: CampaignBrief = {
  name: "Escapada a EjiXhole",
  objective: "impulsar_reservas",
  audience: "familias y parejas que desean salir de la rutina",
  main_emotion: "tranquilidad, convivencia y conexión con la naturaleza",
  offer_focus: "experiencia_general",
  season: "temporada actual",
  channels: ["facebook", "instagram_story", "whatsapp_status"],
  call_to_action: DEFAULT_CTA,
};

function StatusCard({
  status,
  loading,
  onRetry,
}: {
  status: MarketingStatus;
  loading: boolean;
  onRetry: () => void;
}) {
  const ready = status.available;
  return (
    <Card className={cn(ready ? "border-success/30" : "border-warning/30")}>
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "rounded-xl p-2.5",
              ready ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
            )}
          >
            {ready ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          </div>
          <div>
            <p className="font-semibold">
              {ready ? "Marketing listo" : "Marketing preparado · conexión pendiente"}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">{status.message}</p>
            {ready && (
              <p className="mt-1 text-xs text-muted-foreground">
                Conocimiento {status.knowledge_version} · {status.documents} documentos aprobados
              </p>
            )}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onRetry} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Comprobar conexión
        </Button>
      </CardContent>
    </Card>
  );
}

function CampaignPreview({ campaign }: { campaign: MarketingCampaign | null }) {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState<string | null>(null);

  const copyContent = async (channel: MarketingChannel, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(channel);
      window.setTimeout(() => setCopied(null), 1600);
      toast({ title: "Texto copiado", variant: "success" });
    } catch {
      toast({ title: "No se pudo copiar", description: "Selecciona el texto manualmente.", variant: "error" });
    }
  };

  if (!campaign) {
    return (
      <Card className="min-h-[420px]">
        <CardContent className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
          <div className="rounded-2xl bg-primary/10 p-4 text-primary">
            <Sparkles className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">Aquí aparecerá tu campaña</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            MindHigh preparará un borrador diferente para cada canal. Nada se publicará sin tu aprobación.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <Card className="border-success/30 bg-success/5">
        <CardContent className="grid gap-3 p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Campaña</p>
            <p className="mt-1 font-semibold">{campaign.name}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Conocimiento</p>
            <p className="mt-1 font-semibold">{campaign.knowledge_version}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Estado</p>
            <p className="mt-1 flex items-center gap-1.5 font-semibold text-warning">
              <ShieldCheck className="h-4 w-4" /> Requiere tu aprobación
            </p>
          </div>
        </CardContent>
      </Card>

      {campaign.contents.map((content) => {
        const text = [
          content.headline,
          "",
          content.body,
          "",
          content.call_to_action,
          content.hashtags.join(" "),
        ]
          .filter(Boolean)
          .join("\n");
        return (
          <Card key={content.channel}>
            <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
              <div>
                <CardTitle className="text-base">{CHANNEL_LABELS[content.channel]}</CardTitle>
                <CardDescription>Borrador listo para revisar, editar y aprobar.</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void copyContent(content.channel, text)}
              >
                {copied === content.channel ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied === content.channel ? "Copiado" : "Copiar"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="text-base font-semibold">{content.headline}</p>
                <p className="mt-3 whitespace-pre-line text-sm leading-6">{content.body}</p>
                <p className="mt-3 text-sm font-medium text-primary">{content.call_to_action}</p>
                {content.hashtags.length > 0 && (
                  <p className="mt-3 text-sm text-muted-foreground">{content.hashtags.join(" ")}</p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Card>
        <CardContent className="flex items-start gap-3 p-4">
          <BookOpenCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="font-semibold">Fuentes verificables</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Esta propuesta conserva {campaign.knowledge_citations.length} citas privadas de MH-Knowledge.
              No incluye precios, horarios ni promociones inventadas.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function MarketingPage() {
  const { toast } = useToast();
  const [brief, setBrief] = React.useState<CampaignBrief>(INITIAL_BRIEF);
  const [campaign, setCampaign] = React.useState<MarketingCampaign | null>(null);

  const statusQuery = useQuery({
    queryKey: ["marketing", "status"],
    queryFn: marketingApi.getStatus,
    staleTime: 30_000,
    retry: false,
  });

  const status: MarketingStatus = statusQuery.data ?? {
    configured: false,
    available: false,
    knowledge_version: null,
    documents: 0,
    message: statusQuery.isError
      ? "No se pudo consultar el módulo. El resto del panel continúa funcionando."
      : "Comprobando la conexión privada con MH-Core…",
  };

  const draftMutation = useMutation({
    mutationFn: marketingApi.createDraft,
    onSuccess: (result) => {
      setCampaign(result);
      toast({
        title: "Campaña preparada",
        description: "Revisa cada canal antes de aprobar o publicar.",
        variant: "success",
      });
    },
    onError: () => {
      toast({
        title: "No se pudo generar la campaña",
        description: "Comprueba la conexión de Marketing e intenta nuevamente.",
        variant: "error",
      });
    },
  });

  const toggleChannel = (channel: MarketingChannel) => {
    setBrief((current) => ({
      ...current,
      channels: current.channels.includes(channel)
        ? current.channels.filter((item) => item !== channel)
        : [...current.channels, channel],
    }));
  };

  const canGenerate =
    status.available &&
    brief.channels.length > 0 &&
    brief.name.trim().length >= 3 &&
    brief.audience.trim().length >= 3 &&
    brief.main_emotion.trim().length >= 3 &&
    brief.season.trim().length >= 2;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canGenerate) return;
    draftMutation.mutate(brief);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-card to-secondary/10 p-5 sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Megaphone className="h-4 w-4" /> MindHigh dentro de EjiXhole
            </div>
            <h1 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">Marketing</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Prepara campañas para Facebook, Instagram, WhatsApp y Google usando información aprobada de EjiXhole.
            </p>
          </div>
          <div className="rounded-xl border bg-background/80 px-4 py-3 text-sm shadow-sm backdrop-blur">
            <p className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-4 w-4 text-success" /> Control humano obligatorio</p>
            <p className="mt-1 text-xs text-muted-foreground">MindHigh propone. Tú revisas y decides.</p>
          </div>
        </div>
      </div>

      <StatusCard
        status={status}
        loading={statusQuery.isFetching}
        onRetry={() => void statusQuery.refetch()}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Crear borrador</CardTitle>
            <CardDescription>Describe la campaña. No necesitas escribir el texto publicitario.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={submit}>
              <label className="block space-y-1.5 text-sm font-medium">
                Nombre interno
                <Input
                  value={brief.name}
                  onChange={(event) => setBrief({ ...brief, name: event.target.value })}
                  maxLength={120}
                  placeholder="Ej. Escapada familiar de agosto"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5 text-sm font-medium">
                  Objetivo
                  <select
                    value={brief.objective}
                    onChange={(event) =>
                      setBrief({ ...brief, objective: event.target.value as CampaignObjective })
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-[13px] shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  >
                    {OBJECTIVES.map((objective) => (
                      <option key={objective.value} value={objective.value}>{objective.label}</option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-1.5 text-sm font-medium">
                  Enfoque
                  <select
                    value={brief.offer_focus}
                    onChange={(event) =>
                      setBrief({ ...brief, offer_focus: event.target.value as OfferFocus })
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-[13px] shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                  >
                    {FOCUSES.map((focus) => (
                      <option key={focus.value} value={focus.value}>{focus.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block space-y-1.5 text-sm font-medium">
                Público
                <Input
                  value={brief.audience}
                  onChange={(event) => setBrief({ ...brief, audience: event.target.value })}
                  maxLength={240}
                  placeholder="Ej. familias con niños"
                />
              </label>

              <label className="block space-y-1.5 text-sm font-medium">
                Emoción principal
                <Input
                  value={brief.main_emotion}
                  onChange={(event) => setBrief({ ...brief, main_emotion: event.target.value })}
                  maxLength={80}
                  placeholder="Ej. tranquilidad y convivencia"
                />
              </label>

              <label className="block space-y-1.5 text-sm font-medium">
                Temporada o contexto
                <Input
                  value={brief.season}
                  onChange={(event) => setBrief({ ...brief, season: event.target.value })}
                  maxLength={80}
                  placeholder="Ej. vacaciones de verano"
                />
              </label>

              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">Canales</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {CHANNELS.map((channel) => {
                    const checked = brief.channels.includes(channel.value);
                    return (
                      <label
                        key={channel.value}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                          checked ? "border-primary/40 bg-primary/10" : "hover:bg-muted/50"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleChannel(channel.value)}
                          className="h-4 w-4 accent-primary"
                        />
                        {channel.label}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <label className="block space-y-1.5 text-sm font-medium">
                Llamada a la acción
                <textarea
                  value={brief.call_to_action}
                  onChange={(event) => setBrief({ ...brief, call_to_action: event.target.value })}
                  maxLength={240}
                  rows={3}
                  className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-[13px] shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </label>

              {!status.available && (
                <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm">
                  Puedes revisar esta pantalla desde ahora. El botón se activará cuando MH-Core quede conectado.
                </div>
              )}

              <Button className="w-full" type="submit" disabled={!canGenerate || draftMutation.isPending}>
                {draftMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {draftMutation.isPending ? "Preparando campaña…" : "Generar borrador"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <CampaignPreview campaign={campaign} />
      </div>
    </div>
  );
}
