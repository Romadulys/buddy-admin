-- Add V5 hardware fields to device_registrations
ALTER TABLE device_registrations
  ADD COLUMN IF NOT EXISTS wifi_mac TEXT,
  ADD COLUMN IF NOT EXISTS nfc_status TEXT DEFAULT 'inactive',
  ADD COLUMN IF NOT EXISTS nfc_balance DECIMAL(6,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS nfc_daily_limit DECIMAL(6,2) DEFAULT 5.00,
  ADD COLUMN IF NOT EXISTS led_brightness TEXT DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS wifi_ssid TEXT;

-- NFC transactions
CREATE TABLE IF NOT EXISTS nfc_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES device_registrations(id) ON DELETE CASCADE,
  buddy_id UUID REFERENCES buddies(id),
  merchant TEXT NOT NULL,
  amount DECIMAL(6,2) NOT NULL,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- SOS audio clips
CREATE TABLE IF NOT EXISTS sos_audio_clips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID REFERENCES alerts(id) ON DELETE CASCADE,
  device_id UUID REFERENCES device_registrations(id),
  clip_number INTEGER NOT NULL, -- 1, 2, 3
  duration INTEGER DEFAULT 10, -- seconds
  storage_path TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
