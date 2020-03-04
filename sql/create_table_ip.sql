CREATE TABLE IF NOT EXISTS ip (
  unique_id VARCHAR(14) NOT NULL,
  id VARCHAR(14) NOT NULL,
  ip_address VARCHAR(255) NOT NULL,
  time_captured VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL,
  region VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  timezone VARCHAR(255) NOT NULL,
  coordinates VARCHAR(255) NOT NULL,
  isp VARCHAR(255) NOT NULL,
  asp VARCHAR(255) NOT NULL,
  user_agent VARCHAR(255) NOT NULL
)
