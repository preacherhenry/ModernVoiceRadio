-- Migration 011: Advertisement details (description + contact info) for the ad details page

ALTER TABLE advertisements
  ADD COLUMN description TEXT,
  ADD COLUMN contact_phone VARCHAR(30),
  ADD COLUMN contact_whatsapp VARCHAR(30),
  ADD COLUMN contact_email VARCHAR(180),
  ADD COLUMN contact_address TEXT;
