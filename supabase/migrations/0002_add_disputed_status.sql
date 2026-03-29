-- Add 'disputed' value to transaction_status enum
ALTER TYPE transaction_status ADD VALUE IF NOT EXISTS 'disputed';
