-- Create the 'polls' table
CREATE TABLE polls (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    question text NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz
);

-- Create the 'poll_options' table
CREATE TABLE poll_options (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id uuid REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
    text text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Create the 'votes' table
CREATE TABLE votes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    poll_option_id uuid REFERENCES poll_options(id) ON DELETE CASCADE NOT NULL,
    poll_id uuid REFERENCES polls(id) ON DELETE CASCADE NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    -- A user can only vote once per poll
    UNIQUE (user_id, poll_id)
);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- POLICIES for 'polls' table
-- Allow anyone to view polls
CREATE POLICY "Allow public read access to polls" ON polls
    FOR SELECT USING (true);

-- Allow authenticated users to create polls
CREATE POLICY "Allow authenticated users to create polls" ON polls
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow owner to update their own poll
CREATE POLICY "Allow owner to update their poll" ON polls
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Allow owner to delete their own poll
CREATE POLICY "Allow owner to delete their poll" ON polls
    FOR DELETE USING (auth.uid() = user_id);


-- POLICIES for 'poll_options' table
-- Allow anyone to view poll options
CREATE POLICY "Allow public read access to poll options" ON poll_options
    FOR SELECT USING (true);

-- Allow the poll owner to add options to their poll
CREATE POLICY "Allow poll owner to create options" ON poll_options
    FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM polls WHERE id = poll_id));

-- Allow the poll owner to update options on their poll
CREATE POLICY "Allow poll owner to update options" ON poll_options
    FOR UPDATE USING (auth.uid() = (SELECT user_id FROM polls WHERE id = poll_id));

-- Allow the poll owner to delete options from their poll
CREATE POLICY "Allow poll owner to delete options" ON poll_options
    FOR DELETE USING (auth.uid() = (SELECT user_id FROM polls WHERE id = poll_id));


-- POLICIES for 'votes' table
-- Allow anyone to view votes
CREATE POLICY "Allow public read access to votes" ON votes
    FOR SELECT USING (true);

-- Allow authenticated users to cast votes
CREATE POLICY "Allow authenticated users to cast votes" ON votes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Allow users to delete their own vote (change their mind)
CREATE POLICY "Allow user to delete their own vote" ON votes
    FOR DELETE USING (auth.uid() = user_id);
