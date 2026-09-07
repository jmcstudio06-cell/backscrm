-- Remove duplicate transactions, keeping only the oldest one per (show_id, type, description, date, amount)
DELETE FROM transactions
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY show_id, type, description, date, amount
      ORDER BY created_at ASC
    ) as rn
    FROM transactions
    WHERE show_id IS NOT NULL
  ) sub
  WHERE rn > 1
)