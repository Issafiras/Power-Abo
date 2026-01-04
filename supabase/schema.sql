-- Mobile Plans Database Schema
-- Dette script opretter tabellen for mobile planer med RLS (Row Level Security)

-- Opret mobile_plans tabel
CREATE TABLE IF NOT EXISTS mobile_plans (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  name TEXT NOT NULL,
  data_label TEXT NOT NULL, -- 'data' er et reserveret keyword, derfor data_label
  price INTEGER NOT NULL,
  earnings INTEGER,
  features JSONB DEFAULT '[]'::jsonb,
  color TEXT,
  logo TEXT,
  streaming JSONB DEFAULT '[]'::jsonb,
  
  -- Admin felter
  campaign_price INTEGER,
  campaign_end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  sorting_order INTEGER DEFAULT 0,
  
  -- Ekstra felter fra original data
  family_discount BOOLEAN DEFAULT false,
  business BOOLEAN DEFAULT false,
  price_vat_excluded BOOLEAN DEFAULT false,
  most_popular BOOLEAN DEFAULT false,
  earnings_additional INTEGER,
  expires_at DATE,
  intro_price INTEGER,
  intro_months INTEGER,
  original_price INTEGER,
  campaign_expires_at DATE,
  campaign BOOLEAN DEFAULT false,
  streaming_count INTEGER,
  cbb_mix_available BOOLEAN DEFAULT false,
  cbb_mix_pricing JSONB,
  type TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opret index for bedre performance
CREATE INDEX IF NOT EXISTS idx_mobile_plans_provider ON mobile_plans(provider);
CREATE INDEX IF NOT EXISTS idx_mobile_plans_is_active ON mobile_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_mobile_plans_sorting_order ON mobile_plans(sorting_order);

-- Opret trigger for at opdatere updated_at automatisk
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_mobile_plans_updated_at
  BEFORE UPDATE ON mobile_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE mobile_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Alle kan læse aktive planer (public read access)
CREATE POLICY "Public read access for active plans"
  ON mobile_plans
  FOR SELECT
  USING (is_active = true);

-- RLS Policy: Authenticated brugere kan opdatere planer (authenticated update access)
CREATE POLICY "Authenticated users can update plans"
  ON mobile_plans
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- RLS Policy: Alle kan indsætte planer (til seeding)
-- NOTE: Dette kan begrænses senere til kun authenticated brugere hvis nødvendigt
CREATE POLICY "Allow insert for seeding"
  ON mobile_plans
  FOR INSERT
  WITH CHECK (true);

-- Kommentarer til tabellen
COMMENT ON TABLE mobile_plans IS 'Mobile planer fra forskellige udbydere';
COMMENT ON COLUMN mobile_plans.data_label IS 'Data mængde (f.eks. "30 GB", "Fri Data")';
COMMENT ON COLUMN mobile_plans.campaign_price IS 'Kampagnepris hvis der er en aktiv kampagne';
COMMENT ON COLUMN mobile_plans.campaign_end_date IS 'Slutdato for kampagne';
COMMENT ON COLUMN mobile_plans.is_active IS 'Om planen er aktiv og skal vises';
COMMENT ON COLUMN mobile_plans.sorting_order IS 'Rækkefølge for sortering (lavere tal = højere prioritet)';
