-- Insert demo users
-- Password for both users: Demo123!
-- BCrypt hash: $2a$10$XptfskLsT3Yy3kJq1hJJR.n3FqXcQjXjXkJqF9uJqT5JXX9XQQs2O

INSERT INTO users (id, email, password_hash, created_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'demo@notes.app', '$2a$10$XptfskLsT3Yy3kJq1hJJR.n3FqXcQjXjXkJqF9uJqT5JXX9XQQs2O', CURRENT_TIMESTAMP),
    ('550e8400-e29b-41d4-a716-446655440002'::uuid, 'user@notes.app', '$2a$10$XptfskLsT3Yy3kJq1hJJR.n3FqXcQjXjXkJqF9uJqT5JXX9XQQs2O', CURRENT_TIMESTAMP);

-- Insert demo tags
INSERT INTO tags (id, label) VALUES
    ('660e8400-e29b-41d4-a716-446655440001'::uuid, 'work'),
    ('660e8400-e29b-41d4-a716-446655440002'::uuid, 'personal'),
    ('660e8400-e29b-41d4-a716-446655440003'::uuid, 'important');

-- Insert demo notes
INSERT INTO notes (id, owner_id, title, content_md, visibility, created_at, updated_at) VALUES
    ('770e8400-e29b-41d4-a716-446655440001'::uuid, 
     '550e8400-e29b-41d4-a716-446655440001'::uuid, 
     'Welcome to Notes App', 
     '# Welcome!\n\nThis is a demo note with **Markdown** support.\n\n## Features\n- Create and edit notes\n- Add tags\n- Share with others\n- Generate public links',
     'PRIVATE',
     CURRENT_TIMESTAMP,
     CURRENT_TIMESTAMP),
    ('770e8400-e29b-41d4-a716-446655440002'::uuid, 
     '550e8400-e29b-41d4-a716-446655440001'::uuid, 
     'Project Planning', 
     '# Project Tasks\n\n1. Design database schema\n2. Implement API endpoints\n3. Create frontend UI\n4. Write tests',
     'SHARED',
     CURRENT_TIMESTAMP,
     CURRENT_TIMESTAMP);

-- Link tags to notes
INSERT INTO note_tags (note_id, tag_id) VALUES
    ('770e8400-e29b-41d4-a716-446655440001'::uuid, '660e8400-e29b-41d4-a716-446655440003'::uuid),
    ('770e8400-e29b-41d4-a716-446655440002'::uuid, '660e8400-e29b-41d4-a716-446655440001'::uuid);

