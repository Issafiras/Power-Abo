-- Migration: Tillad INSERT for seeding
-- Kør denne SQL i Supabase SQL Editor hvis seeding fejler med RLS fejl

-- Fjern eksisterende INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert plans" ON mobile_plans;

-- Opret ny policy der tillader INSERT for alle (til seeding)
CREATE POLICY "Allow insert for seeding"
  ON mobile_plans
  FOR INSERT
  WITH CHECK (true);
