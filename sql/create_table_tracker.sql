CREATE TABLE IF NOT EXISTS tracker (
  id VARCHAR(14) NOT NULL,
  admin_id VARCHAR(14) NOT NULL,
  original_url VARCHAR(255) NOT NULL,
  short_url VARCHAR(255) NOT NULL,
  monitoring_url VARCHAR(255) NOT NULL
)