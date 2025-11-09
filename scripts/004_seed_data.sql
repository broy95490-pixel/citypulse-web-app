-- Insert sample issues (for testing)
-- Note: These will only work after users are created through the auth flow

-- Sample metrics data
INSERT INTO issue_metrics (date, ward, category, total_issues, resolved_issues, avg_resolution_time_hours)
VALUES
  (CURRENT_DATE - INTERVAL '7 days', 'Ward 1', 'road_maintenance', 15, 10, 48.5),
  (CURRENT_DATE - INTERVAL '7 days', 'Ward 1', 'street_lighting', 8, 6, 24.0),
  (CURRENT_DATE - INTERVAL '7 days', 'Ward 2', 'waste_management', 20, 15, 36.2),
  (CURRENT_DATE - INTERVAL '6 days', 'Ward 1', 'road_maintenance', 12, 8, 52.0),
  (CURRENT_DATE - INTERVAL '6 days', 'Ward 2', 'drainage', 10, 7, 40.5),
  (CURRENT_DATE - INTERVAL '5 days', 'Ward 3', 'public_transport', 5, 4, 28.0),
  (CURRENT_DATE - INTERVAL '5 days', 'Ward 1', 'parks_recreation', 7, 5, 60.0),
  (CURRENT_DATE - INTERVAL '4 days', 'Ward 2', 'water_supply', 18, 12, 45.5),
  (CURRENT_DATE - INTERVAL '3 days', 'Ward 1', 'street_lighting', 6, 5, 20.0),
  (CURRENT_DATE - INTERVAL '2 days', 'Ward 3', 'waste_management', 14, 10, 38.0)
ON CONFLICT (date, ward, category) DO NOTHING;
