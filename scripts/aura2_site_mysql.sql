-- Aura2 site database for Navicat/MySQL.
-- Run this on the same MySQL server used by the Metin2 databases.
-- Game accounts stay in account.account; these tables are only for site data.

CREATE DATABASE IF NOT EXISTS aura2_site
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE aura2_site;

CREATE TABLE IF NOT EXISTS beta_keys (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(64) NOT NULL,
  used_by VARCHAR(50) NULL,
  used_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_beta_keys_code (code),
  KEY idx_beta_keys_used_by (used_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS donations (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  package_label VARCHAR(60) NOT NULL,
  coins_amount INT NOT NULL,
  price_brl INT NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
  notes TEXT NULL,
  mp_payment_id VARCHAR(64) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_donations_mp_payment_id (mp_payment_id),
  KEY idx_donations_username (username),
  KEY idx_donations_status (status),
  KEY idx_donations_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tickets (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  subject VARCHAR(120) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('open', 'answered', 'closed') NOT NULL DEFAULT 'open',
  admin_reply TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_tickets_username (username),
  KEY idx_tickets_status (status),
  KEY idx_tickets_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS news (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(120) NOT NULL,
  content TEXT NOT NULL,
  image_url VARCHAR(500) NULL,
  author VARCHAR(50) NOT NULL,
  published TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_news_published_created_at (published, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS partner_applications (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  channel_name VARCHAR(120) NOT NULL,
  platform ENUM('twitch', 'youtube', 'kick', 'other') NOT NULL,
  channel_url VARCHAR(500) NOT NULL,
  avg_viewers VARCHAR(80) NOT NULL,
  schedule VARCHAR(160) NOT NULL,
  motivation TEXT NOT NULL,
  discord_tag VARCHAR(80) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_partner_applications_status (status),
  KEY idx_partner_applications_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  token CHAR(64) NOT NULL,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_password_reset_tokens_token (token),
  KEY idx_password_reset_tokens_username (username),
  KEY idx_password_reset_tokens_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS email_change_tokens (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  token CHAR(64) NOT NULL,
  username VARCHAR(50) NOT NULL,
  old_email VARCHAR(100) NOT NULL,
  new_email VARCHAR(100) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_email_change_tokens_token (token),
  KEY idx_email_change_tokens_username (username),
  KEY idx_email_change_tokens_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS site_settings (
  setting_key VARCHAR(80) NOT NULL,
  setting_value TEXT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional permission setup.
-- If your Railway/API user is named "website", run these as a MySQL root/admin user
-- and change the password before running.
--
-- CREATE USER IF NOT EXISTS 'website'@'%' IDENTIFIED BY 'CHANGE_THIS_PASSWORD';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON aura2_site.* TO 'website'@'%';
-- GRANT SELECT, INSERT, UPDATE ON account.account TO 'website'@'%';
-- FLUSH PRIVILEGES;
