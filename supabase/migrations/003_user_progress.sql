-- Adaptive AI memory: tracks per-installer knowledge progress
-- The AI uses this to adapt responses — reinforcing weak areas, skipping basics they've mastered
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  installer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic text NOT NULL,
  times_asked int NOT NULL DEFAULT 1,
  last_asked_at timestamptz NOT NULL DEFAULT now(),
  -- 0=never encountered, 50=learning, 100=mastered (updated by AI based on question patterns)
  confidence_score int NOT NULL DEFAULT 0 CHECK (confidence_score BETWEEN 0 AND 100),
  -- Flag topics where installer keeps making errors or asking repeatedly
  is_weak_area boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (installer_id, topic)
);

CREATE INDEX IF NOT EXISTS user_progress_installer_idx ON user_progress (installer_id);
CREATE INDEX IF NOT EXISTS user_progress_weak_areas_idx ON user_progress (installer_id, is_weak_area) WHERE is_weak_area = true;

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "installers_own_progress" ON user_progress
  USING (installer_id = auth.uid());

-- Upsert helper: call this every time a topic is asked
CREATE OR REPLACE FUNCTION upsert_user_progress(
  p_installer_id uuid,
  p_topic text,
  p_confidence_delta int DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO user_progress (installer_id, topic, times_asked, last_asked_at, confidence_score, is_weak_area)
  VALUES (
    p_installer_id,
    p_topic,
    1,
    now(),
    GREATEST(0, LEAST(100, p_confidence_delta)),
    false
  )
  ON CONFLICT (installer_id, topic) DO UPDATE SET
    times_asked = user_progress.times_asked + 1,
    last_asked_at = now(),
    confidence_score = GREATEST(0, LEAST(100, user_progress.confidence_score + p_confidence_delta)),
    -- Mark as weak area if asked 3+ times with low confidence
    is_weak_area = (user_progress.times_asked + 1 >= 3 AND user_progress.confidence_score + p_confidence_delta < 50);
END;
$$;
