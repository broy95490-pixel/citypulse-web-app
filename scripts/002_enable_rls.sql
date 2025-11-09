-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_metrics ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Issues policies
CREATE POLICY "Anyone can view issues"
  ON issues FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create issues"
  ON issues FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own issues"
  ON issues FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Moderators and admins can update any issue"
  ON issues FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('moderator', 'admin')
    )
  );

CREATE POLICY "Users can delete own issues"
  ON issues FOR DELETE
  USING (auth.uid() = user_id);

-- Issue votes policies
CREATE POLICY "Anyone can view votes"
  ON issue_votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can vote"
  ON issue_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes"
  ON issue_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Issue comments policies
CREATE POLICY "Anyone can view comments"
  ON issue_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON issue_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON issue_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON issue_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Issue updates policies
CREATE POLICY "Anyone can view issue updates"
  ON issue_updates FOR SELECT
  USING (true);

CREATE POLICY "Moderators and admins can create updates"
  ON issue_updates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('moderator', 'admin')
    )
  );

-- Issue metrics policies (read-only for all, write for admins)
CREATE POLICY "Anyone can view metrics"
  ON issue_metrics FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage metrics"
  ON issue_metrics FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
