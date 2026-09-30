ALTER TABLE profiles ADD CONSTRAINT fk_profile_avatar FOREIGN KEY (avatar_id) REFERENCES media(id);
ALTER TABLE skills ADD CONSTRAINT ck_skill_level CHECK (level BETWEEN 0 AND 100);
ALTER TABLE experiences ADD CONSTRAINT ck_experience_dates CHECK (end_date IS NULL OR end_date >= start_date);
CREATE INDEX idx_projects_date ON projects(project_date);
CREATE INDEX idx_contact_unread ON contact_messages(is_read,created_at);
CREATE INDEX idx_media_type ON media(type,created_at);
