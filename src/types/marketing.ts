export type CampaignObjective =
  | "atraer_visitas"
  | "impulsar_reservas"
  | "llenar_hospedaje"
  | "promover_camping"
  | "informar"
  | "reactivar_clientes";

export type MarketingChannel =
  | "facebook"
  | "instagram"
  | "instagram_story"
  | "whatsapp_status"
  | "google_business";

export type OfferFocus = "entrada" | "camping" | "hospedaje" | "experiencia_general";

export interface MarketingStatus {
  configured: boolean;
  available: boolean;
  warming_up: boolean;
  knowledge_version: string | null;
  documents: number;
  message: string;
}

export interface CampaignBrief {
  name: string;
  objective: CampaignObjective;
  audience: string;
  main_emotion: string;
  offer_focus: OfferFocus;
  season: string;
  channels: MarketingChannel[];
  call_to_action: string;
}

export interface ChannelContent {
  channel: MarketingChannel;
  headline: string;
  body: string;
  call_to_action: string;
  hashtags: string[];
}

export interface MarketingCampaign {
  name: string;
  objective: CampaignObjective;
  audience: string;
  main_emotion: string;
  offer_focus: OfferFocus;
  season: string;
  knowledge_version: string;
  knowledge_document_ids: string[];
  knowledge_citations: string[];
  requires_human_approval: boolean;
  dynamic_facts_used: string[];
  contents: ChannelContent[];
}
