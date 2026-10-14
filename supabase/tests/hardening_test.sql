-- ============================================================================
-- HackIGNISIA — Hardening Verification Test Script
-- Tests: 20261001000000_hardening.sql
--
-- Execution: Paste this script into the STAGING project's SQL Editor.
-- Safety: Concludes by raising an exception with the full test summary report.
--         This rolls back the entire transaction automatically, leaving zero
--         persistent fixture rows in auth.users or public tables.
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: TEST RESULTS & FIXTURE TABLES SETUP
-- ============================================================================

CREATE TEMP TABLE test_results (
  id serial PRIMARY KEY,
  test_name text NOT NULL,
  status text NOT NULL CHECK (status IN ('PASS', 'FAIL')),
  details text
) ON COMMIT DROP;

GRANT ALL ON test_results TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE test_results_id_seq TO anon, authenticated;

CREATE TEMP TABLE temp_test_fixtures (
  key text PRIMARY KEY,
  val uuid NOT NULL
) ON COMMIT DROP;

GRANT ALL ON temp_test_fixtures TO anon, authenticated;
GRANT SELECT ON temp_test_fixtures TO anon, authenticated;

-- Temporarily disable profile column protection trigger for fixture creation
ALTER TABLE public.profiles DISABLE TRIGGER tr_protect_profile_columns;

DO $$
DECLARE
  -- Primary fixtures
  v_event_id uuid := gen_random_uuid();
  v_team_id uuid := gen_random_uuid();
  v_sub_id uuid := gen_random_uuid();
  v_file_id uuid := gen_random_uuid();
  v_eval_id uuid := gen_random_uuid();

  -- Users
  v_leader_id uuid := gen_random_uuid();
  v_member_id uuid := gen_random_uuid();
  v_judge_ai_id uuid := gen_random_uuid();
  v_judge_ai_2_id uuid := gen_random_uuid();
  v_judge_web_id uuid := gen_random_uuid();
  v_admin_id uuid := gen_random_uuid();

  -- Auxiliary fixture objects for edge case tests (each submission has its OWN unique team)
  v_team_direct_sub_id uuid := gen_random_uuid();
  v_team_no_file_id uuid := gen_random_uuid();
  v_sub_no_file_id uuid := gen_random_uuid();

  v_team_no_title_id uuid := gen_random_uuid();
  v_sub_no_title_id uuid := gen_random_uuid();

  v_team_no_track_id uuid := gen_random_uuid();
  v_sub_no_track_id uuid := gen_random_uuid();

  -- Deadlines & timing auxiliary fixtures
  v_event_future_id uuid := gen_random_uuid();
  v_team_future_id uuid := gen_random_uuid();
  v_sub_future_id uuid := gen_random_uuid();

  v_event_past_id uuid := gen_random_uuid();
  v_team_past_id uuid := gen_random_uuid();
  v_sub_past_id uuid := gen_random_uuid();

  v_event_judge_future_id uuid := gen_random_uuid();
  v_team_jf_id uuid := gen_random_uuid();
  v_sub_jf_id uuid := gen_random_uuid();
  v_eval_jf_id uuid := gen_random_uuid();

  v_event_judge_past_id uuid := gen_random_uuid();
  v_team_jp_id uuid := gen_random_uuid();
  v_sub_jp_id uuid := gen_random_uuid();
  v_eval_jp_id uuid := gen_random_uuid();
BEGIN
  -- 1. Populate temp_test_fixtures
  INSERT INTO temp_test_fixtures (key, val) VALUES
    ('event_id', v_event_id),
    ('team_id', v_team_id),
    ('sub_id', v_sub_id),
    ('file_id', v_file_id),
    ('eval_id', v_eval_id),
    ('leader_id', v_leader_id),
    ('member_id', v_member_id),
    ('judge_ai_id', v_judge_ai_id),
    ('judge_ai_2_id', v_judge_ai_2_id),
    ('judge_web_id', v_judge_web_id),
    ('admin_id', v_admin_id),
    ('team_direct_sub_id', v_team_direct_sub_id),
    ('sub_no_file_id', v_sub_no_file_id),
    ('sub_no_title_id', v_sub_no_title_id),
    ('sub_no_track_id', v_sub_no_track_id),
    ('event_future_id', v_event_future_id),
    ('sub_future_id', v_sub_future_id),
    ('event_past_id', v_event_past_id),
    ('sub_past_id', v_sub_past_id),
    ('event_judge_future_id', v_event_judge_future_id),
    ('sub_jf_id', v_sub_jf_id),
    ('eval_jf_id', v_eval_jf_id),
    ('event_judge_past_id', v_event_judge_past_id),
    ('sub_jp_id', v_sub_jp_id),
    ('eval_jp_id', v_eval_jp_id);

  -- 2. Create users in auth.users (trigger handle_new_user auto-inserts into public.profiles)
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES
    (v_leader_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'leader@fixture.test', 'secret', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Fixture Leader"}', now(), now()),
    (v_member_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'member@fixture.test', 'secret', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Fixture Member"}', now(), now()),
    (v_judge_ai_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'judge_ai@fixture.test', 'secret', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Fixture Judge AI"}', now(), now()),
    (v_judge_ai_2_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'judge_ai_2@fixture.test', 'secret', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Fixture Judge AI 2"}', now(), now()),
    (v_judge_web_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'judge_web@fixture.test', 'secret', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Fixture Judge Web"}', now(), now()),
    (v_admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@fixture.test', 'secret', now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Fixture Admin"}', now(), now());

  -- Update profile roles while tr_protect_profile_columns is disabled
  UPDATE public.profiles SET platform_role = 'participant' WHERE id IN (v_leader_id, v_member_id);
  UPDATE public.profiles SET platform_role = 'judge' WHERE id IN (v_judge_ai_id, v_judge_ai_2_id, v_judge_web_id);
  UPDATE public.profiles SET platform_role = 'admin' WHERE id = v_admin_id;

  -- 3. Ensure official tracks exist
  INSERT INTO public.tracks (name, description) VALUES
    ('AI & Machine Learning', 'AI Track'),
    ('Web & App Development', 'Web Track')
  ON CONFLICT (name) DO NOTHING;

  -- 4. Create primary event (includes required slug NOT NULL column)
  INSERT INTO public.events (
    id, slug, name, description, is_active,
    registration_opens_at, registration_closes_at,
    submission_deadline_at, judging_starts_at, judging_ends_at
  ) VALUES (
    v_event_id, 'fixture-main-' || v_event_id::text,
    'Hardening Main Event', 'Main event for security tests', true,
    now() - interval '2 days', now() + interval '2 days',
    now() + interval '2 days', now() - interval '1 day', now() + interval '2 days'
  );

  INSERT INTO public.event_rubrics (event_id, criteria) VALUES (
    v_event_id,
    '{
      "innovation": { "label": "Innovation & Creativity", "max": 25 },
      "technical": { "label": "Technical Complexity", "max": 25 },
      "impact": { "label": "Impact & Viability", "max": 25 },
      "design": { "label": "Design & UX", "max": 25 }
    }'::jsonb
  );

  -- 5. Primary Team (trigger trg_add_team_creator_as_leader auto-adds leader to team_members)
  INSERT INTO public.teams (id, event_id, name, team_code, created_by, max_members)
  VALUES (v_team_id, v_event_id, 'Fixture AI Team', 'TC' || substring(replace(v_team_id::text, '-', ''), 1, 10), v_leader_id, 4);

  INSERT INTO public.team_members (team_id, profile_id, is_leader, status)
  VALUES (v_team_id, v_member_id, false, 'accepted')
  ON CONFLICT (team_id, profile_id) DO NOTHING;

  -- Auxiliary team for testing direct submission insert (starts with no submission)
  INSERT INTO public.teams (id, event_id, name, team_code, created_by, max_members)
  VALUES (v_team_direct_sub_id, v_event_id, 'Direct Sub Team', 'TC' || substring(replace(v_team_direct_sub_id::text, '-', ''), 1, 10), v_leader_id, 4);

  INSERT INTO public.team_members (team_id, profile_id, is_leader, status)
  VALUES (v_team_direct_sub_id, v_member_id, false, 'accepted')
  ON CONFLICT (team_id, profile_id) DO NOTHING;

  -- 6. Judge assignments
  INSERT INTO public.judge_assignments (judge_id, track)
  VALUES
    (v_judge_ai_id, 'AI & Machine Learning'),
    (v_judge_ai_2_id, 'AI & Machine Learning'),
    (v_judge_web_id, 'Web & App Development')
  ON CONFLICT (judge_id, track) DO NOTHING;

  -- 7. Primary draft submission and presentation file
  INSERT INTO public.submissions (
    id, team_id, title, tagline, problem_statement,
    target_users, solution, innovation, tech_stack,
    track, status, submitted_at
  ) VALUES (
    v_sub_id, v_team_id, 'Autonomous Assistant', 'Smarter Workflows',
    'Inefficiency in manual tasks', 'Engineers', 'AI Automation Agent',
    'Self-evolving workflow graph', 'Next.js, Python, PostgreSQL',
    'AI & Machine Learning', 'draft', NULL
  );

  INSERT INTO public.submission_files (id, submission_id, file_path, file_type, uploaded_by)
  VALUES (v_file_id, v_sub_id, 'fixture-team/presentation.pdf', 'application/pdf', v_leader_id);

  INSERT INTO public.evaluations (id, submission_id, judge_id, status, scores, comments)
  VALUES (
    v_eval_id, v_sub_id, v_judge_ai_id, 'draft',
    '{"innovation": 20}'::jsonb, 'Draft evaluation work in progress'
  );

  -- 8. Submissions for submit_project validation checks (each with its OWN unique team)
  -- (a) Missing file
  INSERT INTO public.teams (id, event_id, name, team_code, created_by)
  VALUES (v_team_no_file_id, v_event_id, 'No File Team', 'TC' || substring(replace(v_team_no_file_id::text, '-', ''), 1, 10), v_leader_id);
  INSERT INTO public.submissions (id, team_id, title, problem_statement, solution, track, status)
  VALUES (v_sub_no_file_id, v_team_no_file_id, 'No File Project', 'Prob', 'Sol', 'AI & Machine Learning', 'draft');

  -- (b) Empty title
  INSERT INTO public.teams (id, event_id, name, team_code, created_by)
  VALUES (v_team_no_title_id, v_event_id, 'No Title Team', 'TC' || substring(replace(v_team_no_title_id::text, '-', ''), 1, 10), v_leader_id);
  INSERT INTO public.submissions (id, team_id, title, problem_statement, solution, track, status)
  VALUES (v_sub_no_title_id, v_team_no_title_id, '', 'Prob', 'Sol', 'AI & Machine Learning', 'draft');
  INSERT INTO public.submission_files (submission_id, file_path, file_type, uploaded_by)
  VALUES (v_sub_no_title_id, 'fixture/file2.pdf', 'application/pdf', v_leader_id);

  -- (c) NULL track
  INSERT INTO public.teams (id, event_id, name, team_code, created_by)
  VALUES (v_team_no_track_id, v_event_id, 'No Track Team', 'TC' || substring(replace(v_team_no_track_id::text, '-', ''), 1, 10), v_leader_id);
  INSERT INTO public.submissions (id, team_id, title, problem_statement, solution, track, status)
  VALUES (v_sub_no_track_id, v_team_no_track_id, 'No Track Project', 'Prob', 'Sol', NULL, 'draft');
  INSERT INTO public.submission_files (submission_id, file_path, file_type, uploaded_by)
  VALUES (v_sub_no_track_id, 'fixture/file3.pdf', 'application/pdf', v_leader_id);

  -- 9. Timing event: window opens in future
  INSERT INTO public.events (id, slug, name, registration_opens_at, submission_deadline_at)
  VALUES (v_event_future_id, 'fixture-fut-' || v_event_future_id::text, 'Future Event', now() + interval '1 day', now() + interval '3 days');
  INSERT INTO public.teams (id, event_id, name, team_code, created_by)
  VALUES (v_team_future_id, v_event_future_id, 'Future Team', 'TC' || substring(replace(v_team_future_id::text, '-', ''), 1, 10), v_leader_id);
  INSERT INTO public.submissions (id, team_id, title, problem_statement, solution, track, status)
  VALUES (v_sub_future_id, v_team_future_id, 'Future Project', 'Prob', 'Sol', 'AI & Machine Learning', 'draft');
  INSERT INTO public.submission_files (submission_id, file_path, file_type, uploaded_by)
  VALUES (v_sub_future_id, 'fixture/file4.pdf', 'application/pdf', v_leader_id);

  -- 10. Timing event: submission deadline in past
  INSERT INTO public.events (id, slug, name, registration_opens_at, submission_deadline_at)
  VALUES (v_event_past_id, 'fixture-past-' || v_event_past_id::text, 'Past Event', now() - interval '3 days', now() - interval '1 hour');
  INSERT INTO public.teams (id, event_id, name, team_code, created_by)
  VALUES (v_team_past_id, v_event_past_id, 'Past Team', 'TC' || substring(replace(v_team_past_id::text, '-', ''), 1, 10), v_leader_id);
  INSERT INTO public.submissions (id, team_id, title, problem_statement, solution, track, status)
  VALUES (v_sub_past_id, v_team_past_id, 'Past Project', 'Prob', 'Sol', 'AI & Machine Learning', 'draft');
  INSERT INTO public.submission_files (submission_id, file_path, file_type, uploaded_by)
  VALUES (v_sub_past_id, 'fixture/file5.pdf', 'application/pdf', v_leader_id);

  -- 11. Judging timing: judging_starts_at in future (submissions pre-submitted via RPC bypass flag)
  INSERT INTO public.events (id, slug, name, judging_starts_at, judging_ends_at)
  VALUES (v_event_judge_future_id, 'fixture-jf-' || v_event_judge_future_id::text, 'JF Event', now() + interval '1 day', now() + interval '3 days');
  INSERT INTO public.event_rubrics (event_id, criteria) VALUES (v_event_judge_future_id, '{"innovation":{"max":25}}'::jsonb);
  INSERT INTO public.teams (id, event_id, name, team_code, created_by)
  VALUES (v_team_jf_id, v_event_judge_future_id, 'JF Team', 'TC' || substring(replace(v_team_jf_id::text, '-', ''), 1, 10), v_leader_id);

  PERFORM set_config('app.submitting_via_rpc', 'true', true);

  INSERT INTO public.submissions (id, team_id, title, problem_statement, solution, track, status, submitted_at)
  VALUES (v_sub_jf_id, v_team_jf_id, 'JF Project', 'Prob', 'Sol', 'AI & Machine Learning', 'submitted', now());
  INSERT INTO public.submission_files (submission_id, file_path, file_type, uploaded_by)
  VALUES (v_sub_jf_id, 'fixture/file_jf.pdf', 'application/pdf', v_leader_id);

  INSERT INTO public.evaluations (id, submission_id, judge_id, status, scores)
  VALUES (v_eval_jf_id, v_sub_jf_id, v_judge_ai_id, 'draft', '{"innovation": 20}'::jsonb);

  -- 12. Judging timing: judging_ends_at in past (submissions pre-submitted via RPC bypass flag)
  INSERT INTO public.events (id, slug, name, judging_starts_at, judging_ends_at)
  VALUES (v_event_judge_past_id, 'fixture-jp-' || v_event_judge_past_id::text, 'JP Event', now() - interval '3 days', now() - interval '1 hour');
  INSERT INTO public.event_rubrics (event_id, criteria) VALUES (v_event_judge_past_id, '{"innovation":{"max":25}}'::jsonb);
  INSERT INTO public.teams (id, event_id, name, team_code, created_by)
  VALUES (v_team_jp_id, v_event_judge_past_id, 'JP Team', 'TC' || substring(replace(v_team_jp_id::text, '-', ''), 1, 10), v_leader_id);

  INSERT INTO public.submissions (id, team_id, title, problem_statement, solution, track, status, submitted_at)
  VALUES (v_sub_jp_id, v_team_jp_id, 'JP Project', 'Prob', 'Sol', 'AI & Machine Learning', 'submitted', now());
  INSERT INTO public.submission_files (submission_id, file_path, file_type, uploaded_by)
  VALUES (v_sub_jp_id, 'fixture/file_jp.pdf', 'application/pdf', v_leader_id);

  INSERT INTO public.evaluations (id, submission_id, judge_id, status, scores)
  VALUES (v_eval_jp_id, v_sub_jp_id, v_judge_ai_id, 'draft', '{"innovation": 20}'::jsonb);

  PERFORM set_config('app.submitting_via_rpc', 'false', true);

END $$;

-- Re-enable the profile columns protection trigger
ALTER TABLE public.profiles ENABLE TRIGGER tr_protect_profile_columns;


-- ============================================================================
-- TESTS 1 & 2: ANON CALLING submit_project & finalize_evaluation
-- ============================================================================
RESET "request.jwt.claims";
SET LOCAL ROLE anon;

DO $$
DECLARE
  v_sub_id uuid;
  v_eval_id uuid;
  v_err text;
  v_passed boolean := false;
BEGIN
  SELECT val INTO v_sub_id FROM temp_test_fixtures WHERE key = 'sub_id';
  SELECT val INTO v_eval_id FROM temp_test_fixtures WHERE key = 'eval_id';

  -- Test 1: anon submit_project
  BEGIN
    PERFORM public.submit_project(v_sub_id);
    v_passed := true;
  EXCEPTION WHEN OTHERS THEN
    v_err := SQLERRM;
    IF v_err LIKE '%permission denied%' OR v_err LIKE '%Not authenticated%' THEN
      INSERT INTO test_results (test_name, status, details) VALUES ('1. anon submit_project rejected', 'PASS', v_err);
    ELSE
      INSERT INTO test_results (test_name, status, details) VALUES ('1. anon submit_project rejected', 'FAIL', 'Unexpected: ' || v_err);
    END IF;
  END;
  IF v_passed THEN
    INSERT INTO test_results (test_name, status, details) VALUES ('1. anon submit_project rejected', 'FAIL', 'Succeeded unexpectedly');
  END IF;

  -- Test 2: anon finalize_evaluation
  v_passed := false;
  BEGIN
    PERFORM public.finalize_evaluation(v_eval_id);
    v_passed := true;
  EXCEPTION WHEN OTHERS THEN
    v_err := SQLERRM;
    IF v_err LIKE '%permission denied%' OR v_err LIKE '%Not authenticated%' THEN
      INSERT INTO test_results (test_name, status, details) VALUES ('2. anon finalize_evaluation rejected', 'PASS', v_err);
    ELSE
      INSERT INTO test_results (test_name, status, details) VALUES ('2. anon finalize_evaluation rejected', 'FAIL', 'Unexpected: ' || v_err);
    END IF;
  END;
  IF v_passed THEN
    INSERT INTO test_results (test_name, status, details) VALUES ('2. anon finalize_evaluation rejected', 'FAIL', 'Succeeded unexpectedly');
  END IF;
END $$;


-- ============================================================================
-- TESTS 3 & 4: AUTHENTICATED CALL WITH NULL auth.uid()
-- ============================================================================
RESET ROLE;
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{}';

DO $$
DECLARE
  v_sub_id uuid;
  v_eval_id uuid;
  v_err text;
  v_passed boolean := false;
BEGIN
  SELECT val INTO v_sub_id FROM temp_test_fixtures WHERE key = 'sub_id';
  SELECT val INTO v_eval_id FROM temp_test_fixtures WHERE key = 'eval_id';

  -- Test 3: submit_project with null auth.uid()
  BEGIN
    PERFORM public.submit_project(v_sub_id);
    v_passed := true;
  EXCEPTION WHEN OTHERS THEN
    v_err := SQLERRM;
    IF v_err LIKE '%Not authenticated%' THEN
      INSERT INTO test_results (test_name, status, details) VALUES ('3. null auth.uid() submit_project rejected', 'PASS', v_err);
    ELSE
      INSERT INTO test_results (test_name, status, details) VALUES ('3. null auth.uid() submit_project rejected', 'FAIL', 'Unexpected: ' || v_err);
    END IF;
  END;
  IF v_passed THEN
    INSERT INTO test_results (test_name, status, details) VALUES ('3. null auth.uid() submit_project rejected', 'FAIL', 'Succeeded unexpectedly');
  END IF;

  -- Test 4: finalize_evaluation with null auth.uid()
  v_passed := false;
  BEGIN
    PERFORM public.finalize_evaluation(v_eval_id);
    v_passed := true;
  EXCEPTION WHEN OTHERS THEN
    v_err := SQLERRM;
    IF v_err LIKE '%Not authenticated%' THEN
      INSERT INTO test_results (test_name, status, details) VALUES ('4. null auth.uid() finalize_evaluation rejected', 'PASS', v_err);
    ELSE
      INSERT INTO test_results (test_name, status, details) VALUES ('4. null auth.uid() finalize_evaluation rejected', 'FAIL', 'Unexpected: ' || v_err);
    END IF;
  END;
  IF v_passed THEN
    INSERT INTO test_results (test_name, status, details) VALUES ('4. null auth.uid() finalize_evaluation rejected', 'FAIL', 'Succeeded unexpectedly');
  END IF;
END $$;


-- ============================================================================
-- TEST 5: compute_evaluation_score() REJECTS NULL & NON-NUMERIC SCORES
-- ============================================================================
RESET ROLE;
DO $$
DECLARE
  v_sub_id uuid;
  v_judge_ai_2_id uuid;
  v_err text;
  v_passed boolean := false;
BEGIN
  SELECT val INTO v_sub_id FROM temp_test_fixtures WHERE key = 'sub_id';
  SELECT val INTO v_judge_ai_2_id FROM temp_test_fixtures WHERE key = 'judge_ai_2_id';

  -- 5a. NULL criterion score in JSON object
  BEGIN
    INSERT INTO public.evaluations (submission_id, judge_id, status, scores)
    VALUES (v_sub_id, v_judge_ai_2_id, 'draft', '{"innovation": null, "technical": 20}'::jsonb);
    v_passed := true;
  EXCEPTION WHEN OTHERS THEN
    v_err := SQLERRM;
    IF v_err LIKE '%must be a number%' THEN
      INSERT INTO test_results (test_name, status, details) VALUES ('5a. null score value rejected', 'PASS', v_err);
    ELSE
      INSERT INTO test_results (test_name, status, details) VALUES ('5a. null score value rejected', 'FAIL', 'Unexpected: ' || v_err);
    END IF;
  END;
  IF v_passed THEN
    INSERT INTO test_results (test_name, status, details) VALUES ('5a. null score value rejected', 'FAIL', 'Succeeded unexpectedly');
  END IF;

  -- 5b. String score
  v_passed := false;
  BEGIN
    INSERT INTO public.evaluations (submission_id, judge_id, status, scores)
    VALUES (v_sub_id, v_judge_ai_2_id, 'draft', '{"innovation": "25"}'::jsonb);
    v_passed := true;
  EXCEPTION WHEN OTHERS THEN
    v_err := SQLERRM;
    IF v_err LIKE '%must be a number%' THEN
      INSERT INTO test_results (test_name, status, details) VALUES ('5b. string score rejected', 'PASS', v_err);
    ELSE
      INSERT INTO test_results (test_name, status, details) VALUES ('5b. string score rejected', 'FAIL', 'Unexpected: ' || v_err);
    END IF;
  END;
  IF v_passed THEN
    INSERT INTO test_results (test_name, status, details) VALUES ('5b. string score rejected', 'FAIL', 'Succeeded unexpectedly');
  END IF;

  -- 5c. Nested object score
  v_passed := false;
  BEGIN
    INSERT INTO public.evaluations (submission_id, judge_id, status, scores)
    VALUES (v_sub_id, v_judge_ai_2_id, 'draft', '{"innovation": {"pts": 25}}'::jsonb);
    v_passed := true;
  EXCEPTION WHEN OTHERS THEN
    v_err := SQLERRM;
    IF v_err LIKE '%must be a number%' THEN
      INSERT INTO test_results (test_name, status, details) VALUES ('5c. object score rejected', 'PASS', v_err);
    ELSE
      INSERT INTO test_results (test_name, status, details) VALUES ('5c. object score rejected', 'FAIL', 'Unexpected: ' || v_err);
    END IF;
  END;
  IF v_passed THEN
    INSERT INTO test_results (test_name, status, details) VALUES ('5c. object score rejected', 'FAIL', 'Succeeded unexpectedly');
  END IF;

  -- 5d. Score exceeding max
  v_passed := false;
  BEGIN
    INSERT INTO public.evaluations (submission_id, judge_id, status, scores)
    VALUES (v_sub_id, v_judge_ai_2_id, 'draft', '{"innovation": 999}'::jsonb);
    v_passed := true;
  EXCEPTION WHEN OTHERS THEN
    v_err := SQLERRM;
    IF v_err LIKE '%exceeds maximum allowed%' THEN
      INSERT INTO test_results (test_name, status, details) VALUES ('5d. score exceeding max rejected', 'PASS', v_err);
    ELSE
      INSERT INTO test_results (test_name, status, details) VALUES ('5d. score exceeding max rejected', 'FAIL', 'Unexpected: ' || v_err);
    END IF;
  END;
  IF v_passed THEN
    INSERT INTO test_results (test_name, status, details) VALUES ('5d. score exceeding max rejected', 'FAIL', 'Succeeded unexpectedly');
  END IF;
END $$;


-- ============================================================================
-- TEST 6: compute_evaluation_score() FAILS CLOSED IF RUBRIC CRITERION HAS NO 'max'
-- ============================================================================
RESET ROLE;
DO $$
DECLARE
  v_event_id uuid;
  v_sub_id uuid;
  v_judge_ai_2_id uuid;
  v_err text;
  v_passed boolean := false;
BEGIN
  SELECT val INTO v_event_id FROM temp_test_fixtures WHERE key = 'event_id';
  SELECT val INTO v_sub_id FROM temp_test_fixtures WHERE key = 'sub_id';
  SELECT val INTO v_judge_ai_2_id FROM temp_test_fixtures WHERE key = 'judge_ai_2_id';

  -- Temporarily update rubric to omit 'max'
  UPDATE public.event_rubrics
  SET criteria = '{"innovation": { "label": "No Max Configured" }}'::jsonb
  WHERE event_id = v_event_id;

  BEGIN
    INSERT INTO public.evaluations (submission_id, judge_id, status, scores)
    VALUES (v_sub_id, v_judge_ai_2_id, 'draft', '{"innovation": 20}'::jsonb);
    v_passed := true;
  EXCEPTION WHEN OTHERS THEN
    v_err := SQLERRM;
    IF v_err LIKE '%no maximum score configured%' THEN
      INSERT INTO test_results (test_name, status, details) VALUES ('6. rubric criterion without max rejected', 'PASS', v_err);
    ELSE
      INSERT INTO test_results (test_name, status, details) VALUES ('6. rubric criterion without max rejected', 'FAIL', 'Unexpected: ' || v_err);
    END IF;
  END;
  IF v_passed THEN
    INSERT INTO test_results (test_name, status, details) VALUES ('6. rubric criterion without max rejected', 'FAIL', 'Succeeded unexpectedly');
  END IF;

  -- Restore valid rubric
  UPDATE public.event_rubrics
  SET criteria = '{
    "innovation": { "label": "Innovation & Creativity", "max": 25 },
    "technical": { "label": "Technical Complexity", "max": 25 },
    "impact": { "label": "Impact & Viability", "max": 25 },
    "design": { "label": "Design & UX", "max": 25 }
  }'::jsonb
  WHERE event_id = v_event_id;
END $$;


-- ============================================================================
-- TEST 7: SUBMISSION STATUS LOCKS (DIRECT INSERT & DIRECT UPDATE OF STATUS)
-- ============================================================================
RESET ROLE;
DO $$
DECLARE
  v_team_direct_sub_id uuid;
  v_sub_id uuid;
  v_member_id uuid;
  v_claims text;
  v_err text;
  v_passed boolean := false;
BEGIN
  SELECT val INTO v_team_direct_sub_id FROM temp_test_fixtures WHERE key = 'team_direct_sub_id';
  SELECT val INTO v_sub_id FROM temp_test_fixtures WHERE key = 'sub_id';
  SELECT val INTO v_member_id FROM temp_test_fixtures WHERE key = 'member_id';
  v_claims := '{"sub": "' || v_member_id || '", "role": "authenticated"}';

  EXECUTE 'SET LOCAL ROLE authenticated';
  EXECUTE 'SET LOCAL "request.jwt.claims" TO ''' || v_claims || '''';

  -- 7a. Direct INSERT with status = 'submitted' -> REJECTED by trigger / RLS
  BEGIN
    INSERT INTO public.submissions (team_id, title, problem_statement, solution, track, status)
    VALUES (v_team_direct_sub_id, 'Cheat Submission', 'Prob', 'Sol', 'AI & Machine Learning', 'submitted');
    v_passed := true;
  EXCEPTION WHEN OTHERS THEN
    v_err := SQLERRM;
    IF v_err LIKE '%row-level security%' OR v_err LIKE '%New submissions must start as draft%' THEN
      INSERT INTO test_results (test_name, status, details) VALUES ('7a. direct INSERT status=submitted rejected', 'PASS', v_err);
    ELSE
      INSERT INTO test_results (test_name, status, details) VALUES ('7a. direct INSERT status=submitted rejected', 'FAIL', 'Unexpected: ' || v_err);
    END IF;
  END;
  IF v_passed THEN
    INSERT INTO test_results (test_name, status, details) VALUES ('7a. direct INSERT status=submitted rejected', 'FAIL', 'Succeeded unexpectedly');
  END IF;

  -- 7b. Direct UPDATE of status to 'submitted' while still draft -> REJECTED by trigger
  v_passed := false;
  BEGIN
    UPDATE public.submissions
    SET status = 'submitted', submitted_at = now()
    WHERE id = v_sub_id;
    v_passed := true;
  EXCEPTION WHEN OTHERS THEN
    v_err := SQLERRM;
    IF v_err LIKE '%Cannot modify submission status directly%' THEN
      INSERT INTO test_results (test_name, status, details) VALUES ('7b. direct UPDATE status=submitted rejected', 'PASS', v_err);
    ELSE
      INSERT INTO test_results (test_name, status, details) VALUES ('7b. direct UPDATE status=submitted rejected', 'FAIL', 'Unexpected: ' || v_err);
    END IF;
  END;
  IF v_passed THEN
    INSERT INTO test_results (test_name, status, details) VALUES ('7b. direct UPDATE status=submitted rejected', 'FAIL', 'Succeeded unexpectedly');
  END IF;
END $$;


-- ============================================================================
-- TEST 8: JUDGE DIRECT INSERT EVALUATION STATUS='final' -> REJECTED
-- Uses already-submitted JF fixture and asserts 'New evaluations must start as draft'
-- ============================================================================
RESET ROLE;
DO $$
DECLARE
  v_sub_jf_id uuid;
  v_judge_ai_2_id uuid;
  v_claims text;
  v_err text;
  v_passed boolean := false;
BEGIN
  SELECT val INTO v_sub_jf_id FROM temp_test_fixtures WHERE key = 'sub_jf_id';
  SELECT val INTO v_judge_ai_2_id FROM temp_test_fixtures WHERE key = 'judge_ai_2_id';
  v_claims := '{"sub": "' || v_judge_ai_2_id || '", "role": "authenticated"}';

  EXECUTE 'SET LOCAL ROLE authenticated';
  EXECUTE 'SET LOCAL "request.jwt.claims" TO ''' || v_claims || '''';

  BEGIN
    INSERT INTO public.evaluations (submission_id, judge_id, status, scores)
    VALUES (v_sub_jf_id, v_judge_ai_2_id, 'final', '{"innovation": 20}'::jsonb);
    v_passed := true;
  EXCEPTION WHEN OTHERS THEN
    v_err := SQLERRM;
    IF v_err LIKE '%New evaluations must start as draft%' THEN
      INSERT INTO test_results (test_name, status, details) VALUES ('8. direct INSERT eval status=final rejected', 'PASS', v_err);
    ELSE
      INSERT INTO test_results (test_name, status, details) VALUES ('8. direct INSERT eval status=final rejected', 'FAIL', 'Unexpected: ' || v_err);
    END IF;
  END;
  IF v_passed THEN
    INSERT INTO test_results (test_name, status, details) VALUES ('8. direct INSERT eval status=final rejected', 'FAIL', 'Succeeded unexpectedly');
  END IF;
END $$;


-- ============================================================================
-- TEST 9: BLIND SCORING: SECOND JUDGE ON SAME TRACK CANNOT SELECT EVALUATION
-- ============================================================================
RESET ROLE;
DO $$
DECLARE
  v_eval_id uuid;
  v_judge_ai_2_id uuid;
  v_claims text;
  v_count integer;
BEGIN
  SELECT val INTO v_eval_id FROM temp_test_fixtures WHERE key = 'eval_id';
  SELECT val INTO v_judge_ai_2_id FROM temp_test_fixtures WHERE key = 'judge_ai_2_id';
  v_claims := '{"sub": "' || v_judge_ai_2_id || '", "role": "authenticated"}';

  EXECUTE 'SET LOCAL ROLE authenticated';
  EXECUTE 'SET LOCAL "request.jwt.claims" TO ''' || v_claims || '''';

  SELECT count(*) INTO v_count
  FROM public.evaluations
  WHERE id = v_eval_id;

  IF v_count = 0 THEN
    INSERT INTO test_results (test_name, status, details)
    VALUES ('9. blind scoring: peer judge cannot SELECT eval', 'PASS', 'Count was 0 (evaluation hidden)');
  ELSE
    INSERT INTO test_results (test_name, status, details)
    VALUES ('9. blind scoring: peer judge cannot SELECT eval', 'FAIL', 'Peer judge saw evaluation! Count: ' || v_count);
  END IF;
END $$;


-- ============================================================================
-- TEST 10: PARTICIPANT UPDATE OF OWN platform_role & payment_status REJECTED
-- ============================================================================
RESET ROLE;
DO $$
DECLARE
  v_member_id uuid;
  v_claims text;
  v_err text;
  v_passed boolean := false;
BEGIN
  SELECT val INTO v_member_id FROM temp_test_fixtures WHERE key = 'member_id';
  v_claims := '{"sub": "' || v_member_id || '", "role": "authenticated"}';

  EXECUTE 'SET LOCAL ROLE authenticated';
  EXECUTE 'SET LOCAL "request.jwt.claims" TO ''' || v_claims || '''';

  -- 10a. Update platform_role
  BEGIN
    UPDATE public.profiles SET platform_role = 'admin' WHERE id = v_member_id;
    v_passed := true;
  EXCEPTION WHEN OTHERS THEN
    v_err := SQLERRM;
    IF v_err LIKE '%Cannot update protected columns%' THEN
      INSERT INTO test_results (test_name, status, details) VALUES ('10a. participant edit platform_role rejected', 'PASS', v_err);
    ELSE
      INSERT INTO test_results (test_name, status, details) VALUES ('10a. participant edit platform_role rejected', 'FAIL', 'Unexpected: ' || v_err);
    END IF;
  END;
  IF v_passed THEN
    INSERT INTO test_results (test_name, status, details) VALUES ('10a. participant edit platform_role rejected', 'FAIL', 'Succeeded unexpectedly');
  END IF;

  -- 10b. Update payment_status
  v_passed := false;
  BEGIN
    UPDATE public.profiles SET payment_status = 'paid' WHERE id = v_member_id;
    v_passed := true;
  EXCEPTION WHEN OTHERS THEN
    v_err := SQLERRM;
    IF v_err LIKE '%Cannot update protected columns%' THEN
      INSERT INTO test_results (test_name, status, details) VALUES ('10b. participant edit payment_status rejected', 'PASS', v_err);
    ELSE
      INSERT INTO test_results (test_name, status, details) VALUES ('10b. participant edit payment_status rejected', 'FAIL', 'Unexpected: ' || v_err);
    END IF;
  END;
  IF v_passed THEN
    INSERT INTO test_results (test_name, status, details) VALUES ('10b. participant edit payment_status rejected', 'FAIL', 'Succeeded unexpectedly');
  END IF;
END $$;


-- ============================================================================
-- TEST 11: submit_project VALIDATION REQUIREMENTS (FILES, TITLE, TRACK, DATES)
-- ============================================================================
RESET ROLE;
DO $$
DECLARE
  v_leader_id uuid;
  v_claims text;
  v_sub_no_file_id uuid;
  v_sub_no_title_id uuid;
  v_sub_no_track_id uuid;
  v_sub_future_id uuid;
  v_sub_past_id uuid;
  v_err text;
  v_passed boolean := false;
BEGIN
  SELECT val INTO v_leader_id FROM temp_test_fixtures WHERE key = 'leader_id';
  SELECT val INTO v_sub_no_file_id FROM temp_test_fixtures WHERE key = 'sub_no_file_id';
  SELECT val INTO v_sub_no_title_id FROM temp_test_fixtures WHERE key = 'sub_no_title_id';
  SELECT val INTO v_sub_no_track_id FROM temp_test_fixtures WHERE key = 'sub_no_track_id';
  SELECT val INTO v_sub_future_id FROM temp_test_fixtures WHERE key = 'sub_future_id';
  SELECT val INTO v_sub_past_id FROM temp_test_fixtures WHERE key = 'sub_past_id';

  v_claims := '{"sub": "' || v_leader_id || '", "role": "authenticated"}';
  EXECUTE 'SET LOCAL ROLE authenticated';
  EXECUTE 'SET LOCAL "request.jwt.claims" TO ''' || v_claims || '''';

  -- 11a. Missing presentation file
  BEGIN
    PERFORM public.submit_project(v_sub_no_file_id);
    v_passed := true;
  EXCEPTION WHEN OTHERS THEN
    v_err := SQLERRM;
    IF v_err LIKE '%presentation file is required%' THEN
      INSERT INTO test_results (test_name, status, details) VALUES ('11a. submit missing file rejected', 'PASS', v_err);
    ELSE
      INSERT INTO test_results (test_name, status, details) VALUES ('11a. submit missing file rejected', 'FAIL', 'Unexpected: ' || v_err);
    END IF;
  END;
  IF v_passed THEN
    INSERT INTO test_results (test_name, status, details) VALUES ('11a. submit missing file rejected', 'FAIL', 'Succeeded unexpectedly');
  END IF;

  -- 11b. Empty title
  v_passed := false;
  BEGIN
    PERFORM public.submit_project(v_sub_no_title_id);
    v_passed := true;
  EXCEPTION WHEN OTHERS THEN
    v_err := SQLERRM;
    IF v_err LIKE '%Project title is required%' THEN
      INSERT INTO test_results (test_name, status, details) VALUES ('11b. submit empty title rejected', 'PASS', v_err);
    ELSE
      INSERT INTO test_results (test_name, status, details) VALUES ('11b. submit empty title rejected', 'FAIL', 'Unexpected: ' || v_err);
    END IF;
  END;
  IF v_passed THEN
    INSERT INTO test_results (test_name, status, details) VALUES ('11b. submit empty title rejected', 'FAIL', 'Succeeded unexpectedly');
  END IF;

  -- 11c. NULL track
  v_passed := false;
  BEGIN
    PERFORM public.submit_project(v_sub_no_track_id);
    v_passed := true;
  EXCEPTION WHEN OTHERS THEN
    v_err := SQLERRM;
    IF v_err LIKE '%Project track is required%' THEN
      INSERT INTO test_results (test_name, status, details) VALUES ('11c. submit NULL track rejected', 'PASS', v_err);
    ELSE
      INSERT INTO test_results (test_name, status, details) VALUES ('11c. submit NULL track rejected', 'FAIL', 'Unexpected: ' || v_err);
    END IF;
  END;
  IF v_passed THEN
    INSERT INTO test_results (test_name, status, details) VALUES ('11c. submit NULL track rejected', 'FAIL', 'Succeeded unexpectedly');
  END IF;

  -- 11d. Before registration/window opens
  v_passed := false;
  BEGIN
    PERFORM public.submit_project(v_sub_future_id);
    v_passed := true;
  EXCEPTION WHEN OTHERS THEN
    v_err := SQLERRM;
    IF v_err LIKE '%Submission window has not opened yet%' THEN
      INSERT INTO test_results (test_name, status, details) VALUES ('11d. submit before window opens rejected', 'PASS', v_err);
    ELSE
      INSERT INTO test_results (test_name, status, details) VALUES ('11d. submit before window opens rejected', 'FAIL', 'Unexpected: ' || v_err);
    END IF;
  END;
  IF v_passed THEN
    INSERT INTO test_results (test_name, status, details) VALUES ('11d. submit before window opens rejected', 'FAIL', 'Succeeded unexpectedly');
  END IF;

  -- 11e. After deadline
  v_passed := false;
  BEGIN
    PERFORM public.submit_project(v_sub_past_id);
    v_passed := true;
  EXCEPTION WHEN OTHERS THEN
    v_err := SQLERRM;
    IF v_err LIKE '%Submission deadline has passed%' THEN
      INSERT INTO test_results (test_name, status, details) VALUES ('11e. submit after deadline rejected', 'PASS', v_err);
    ELSE
      INSERT INTO test_results (test_name, status, details) VALUES ('11e. submit after deadline rejected', 'FAIL', 'Unexpected: ' || v_err);
    END IF;
  END;
  IF v_passed THEN
    INSERT INTO test_results (test_name, status, details) VALUES ('11e. submit after deadline rejected', 'FAIL', 'Succeeded unexpectedly');
  END IF;
END $$;


-- ============================================================================
-- TEST 12: SUCCESSFUL SUBMIT_PROJECT & RE-SUBMIT REJECTION
-- ============================================================================
RESET ROLE;
DO $$
DECLARE
  v_sub_id uuid;
  v_leader_id uuid;
  v_member_id uuid;
  v_claims text;
  v_err text;
  v_passed boolean := false;
  v_sub_row record;
BEGIN
  SELECT val INTO v_sub_id FROM temp_test_fixtures WHERE key = 'sub_id';
  SELECT val INTO v_leader_id FROM temp_test_fixtures WHERE key = 'leader_id';
  SELECT val INTO v_member_id FROM temp_test_fixtures WHERE key = 'member_id';

  -- 12a. Non-leader (regular member) submission attempt -> REJECTED
  v_claims := '{"sub": "' || v_member_id || '", "role": "authenticated"}';
  EXECUTE 'SET LOCAL ROLE authenticated';
  EXECUTE 'SET LOCAL "request.jwt.claims" TO ''' || v_claims || '''';

  BEGIN
    PERFORM public.submit_project(v_sub_id);
    v_passed := true;
  EXCEPTION WHEN OTHERS THEN
    v_err := SQLERRM;
    IF v_err LIKE '%Only the team leader can submit the project%' THEN
      INSERT INTO test_results (test_name, status, details) VALUES ('12a. member submit rejected', 'PASS', v_err);
    ELSE
      INSERT INTO test_results (test_name, status, details) VALUES ('12a. member submit rejected', 'FAIL', 'Unexpected: ' || v_err);
    END IF;
  END;
  IF v_passed THEN
    INSERT INTO test_results (test_name, status, details) VALUES ('12a. member submit rejected', 'FAIL', 'Succeeded unexpectedly');
  END IF;

  -- 12b. Leader submits successfully
  v_claims := '{"sub": "' || v_leader_id || '", "role": "authenticated"}';
  EXECUTE 'SET LOCAL ROLE authenticated';
  EXECUTE 'SET LOCAL "request.jwt.claims" TO ''' || v_claims || '''';

  PERFORM public.submit_project(v_sub_id);

  SELECT * INTO v_sub_row FROM public.submissions WHERE id = v_sub_id;
  IF v_sub_row.status = 'submitted' AND v_sub_row.submitted_at IS NOT NULL THEN
    INSERT INTO test_results (test_name, status, details) VALUES ('12b. leader submit succeeded', 'PASS', 'Status is submitted');
  ELSE
    INSERT INTO test_results (test_name, status, details) VALUES ('12b. leader submit succeeded', 'FAIL', 'Status was not updated');
  END IF;

  -- 12c. Re-submission attempt -> REJECTED
  v_passed := false;
  BEGIN
    PERFORM public.submit_project(v_sub_id);
    v_passed := true;
  EXCEPTION WHEN OTHERS THEN
    v_err := SQLERRM;
    IF v_err LIKE '%has already been submitted%' THEN
      INSERT INTO test_results (test_name, status, details) VALUES ('12c. re-submit rejected', 'PASS', v_err);
    ELSE
      INSERT INTO test_results (test_name, status, details) VALUES ('12c. re-submit rejected', 'FAIL', 'Unexpected: ' || v_err);
    END IF;
  END;
  IF v_passed THEN
    INSERT INTO test_results (test_name, status, details) VALUES ('12c. re-submit rejected', 'FAIL', 'Succeeded unexpectedly');
  END IF;
END $$;


-- ============================================================================
-- TEST 13: POST-SUBMISSION TAMPERING (FIELD EDITS, STATUS DOWNGRADE, FILE INSERT)
-- ============================================================================
RESET ROLE;
DO $$
DECLARE
  v_sub_id uuid;
  v_member_id uuid;
  v_claims text;
  v_rows integer;
  v_status text;
  v_err text;
  v_passed boolean := false;
BEGIN
  SELECT val INTO v_sub_id FROM temp_test_fixtures WHERE key = 'sub_id';
  SELECT val INTO v_member_id FROM temp_test_fixtures WHERE key = 'member_id';
  v_claims := '{"sub": "' || v_member_id || '", "role": "authenticated"}';

  EXECUTE 'SET LOCAL ROLE authenticated';
  EXECUTE 'SET LOCAL "request.jwt.claims" TO ''' || v_claims || '''';

  -- 13a. Member attempts to edit submission fields after submit -> RLS filters row (ROW_COUNT = 0)
  UPDATE public.submissions
  SET title = 'Tampered Title After Submit'
  WHERE id = v_sub_id;

  GET DIAGNOSTICS v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    INSERT INTO test_results (test_name, status, details) VALUES ('13a. post-submit edit blocked by RLS', 'PASS', '0 rows updated');
  ELSE
    INSERT INTO test_results (test_name, status, details) VALUES ('13a. post-submit edit blocked by RLS', 'FAIL', 'Updated rows: ' || v_rows);
  END IF;

  -- 13b. Member attempts to downgrade status back to 'draft' -> RLS filters row (ROW_COUNT = 0), status unchanged
  UPDATE public.submissions
  SET status = 'draft'
  WHERE id = v_sub_id;

  GET DIAGNOSTICS v_rows = ROW_COUNT;

  RESET ROLE;
  SELECT status INTO v_status FROM public.submissions WHERE id = v_sub_id;

  IF v_rows = 0 AND v_status = 'submitted' THEN
    INSERT INTO test_results (test_name, status, details) VALUES ('13b. post-submit status downgrade blocked', 'PASS', '0 rows updated, status remains submitted');
  ELSE
    INSERT INTO test_results (test_name, status, details) VALUES ('13b. post-submit status downgrade blocked', 'FAIL', 'Rows updated: ' || v_rows || ', status: ' || v_status);
  END IF;

  -- 13c. Member attempts to insert file after submit -> RLS rejects WITH CHECK
  EXECUTE 'SET LOCAL ROLE authenticated';
  EXECUTE 'SET LOCAL "request.jwt.claims" TO ''' || v_claims || '''';

  BEGIN
    INSERT INTO public.submission_files (submission_id, file_path, file_type, uploaded_by)
    VALUES (v_sub_id, 'fixture/tamper.pdf', 'application/pdf', v_member_id);
    v_passed := true;
  EXCEPTION WHEN OTHERS THEN
    v_err := SQLERRM;
    IF v_err LIKE '%violates row-level security policy%' THEN
      INSERT INTO test_results (test_name, status, details) VALUES ('13c. post-submit file insert rejected', 'PASS', v_err);
    ELSE
      INSERT INTO test_results (test_name, status, details) VALUES ('13c. post-submit file insert rejected', 'FAIL', 'Unexpected: ' || v_err);
    END IF;
  END;
  IF v_passed THEN
    INSERT INTO test_results (test_name, status, details) VALUES ('13c. post-submit file insert rejected', 'FAIL', 'Succeeded unexpectedly');
  END IF;
END $$;


-- ============================================================================
-- TEST 14: JUDGE ON DIFFERENT TRACK UNABLE TO SEE OR EVALUATE SUBMISSION
-- ============================================================================
RESET ROLE;
DO $$
DECLARE
  v_sub_id uuid;
  v_judge_web_id uuid;
  v_claims text;
  v_count integer;
  v_err text;
  v_passed boolean := false;
BEGIN
  SELECT val INTO v_sub_id FROM temp_test_fixtures WHERE key = 'sub_id';
  SELECT val INTO v_judge_web_id FROM temp_test_fixtures WHERE key = 'judge_web_id';
  v_claims := '{"sub": "' || v_judge_web_id || '", "role": "authenticated"}';

  EXECUTE 'SET LOCAL ROLE authenticated';
  EXECUTE 'SET LOCAL "request.jwt.claims" TO ''' || v_claims || '''';

  -- 14a. SELECT submissions -> returns 0
  SELECT count(*) INTO v_count FROM public.submissions WHERE id = v_sub_id;
  IF v_count = 0 THEN
    INSERT INTO test_results (test_name, status, details) VALUES ('14a. cross-track submission SELECT hidden', 'PASS', 'Count was 0');
  ELSE
    INSERT INTO test_results (test_name, status, details) VALUES ('14a. cross-track submission SELECT hidden', 'FAIL', 'Saw submission! Count: ' || v_count);
  END IF;

  -- 14b. INSERT evaluation -> RLS rejects
  BEGIN
    INSERT INTO public.evaluations (submission_id, judge_id, status, scores)
    VALUES (v_sub_id, v_judge_web_id, 'draft', '{"innovation": 20}'::jsonb);
    v_passed := true;
  EXCEPTION WHEN OTHERS THEN
    v_err := SQLERRM;
    IF v_err LIKE '%violates row-level security policy%' THEN
      INSERT INTO test_results (test_name, status, details) VALUES ('14b. cross-track evaluation INSERT rejected', 'PASS', v_err);
    ELSE
      INSERT INTO test_results (test_name, status, details) VALUES ('14b. cross-track evaluation INSERT rejected', 'FAIL', 'Unexpected: ' || v_err);
    END IF;
  END;
  IF v_passed THEN
    INSERT INTO test_results (test_name, status, details) VALUES ('14b. cross-track evaluation INSERT rejected', 'FAIL', 'Succeeded unexpectedly');
  END IF;
END $$;


-- ============================================================================
-- TEST 15: finalize_evaluation CRITERIA CHECKS (PARTIAL SCORES & EMPTY {})
-- ============================================================================
RESET ROLE;
DO $$
DECLARE
  v_eval_id uuid;
  v_judge_ai_id uuid;
  v_claims text;
  v_err text;
  v_passed boolean := false;
BEGIN
  SELECT val INTO v_eval_id FROM temp_test_fixtures WHERE key = 'eval_id';
  SELECT val INTO v_judge_ai_id FROM temp_test_fixtures WHERE key = 'judge_ai_id';
  v_claims := '{"sub": "' || v_judge_ai_id || '", "role": "authenticated"}';

  EXECUTE 'SET LOCAL ROLE authenticated';
  EXECUTE 'SET LOCAL "request.jwt.claims" TO ''' || v_claims || '''';

  -- 15a. Evaluation has only {"innovation": 20} (missing technical, impact, design)
  BEGIN
    PERFORM public.finalize_evaluation(v_eval_id);
    v_passed := true;
  EXCEPTION WHEN OTHERS THEN
    v_err := SQLERRM;
    IF v_err LIKE '%All criteria must be scored before finalizing%' THEN
      INSERT INTO test_results (test_name, status, details) VALUES ('15a. finalize with missing criteria rejected', 'PASS', v_err);
    ELSE
      INSERT INTO test_results (test_name, status, details) VALUES ('15a. finalize with missing criteria rejected', 'FAIL', 'Unexpected: ' || v_err);
    END IF;
  END;
  IF v_passed THEN
    INSERT INTO test_results (test_name, status, details) VALUES ('15a. finalize with missing criteria rejected', 'FAIL', 'Succeeded unexpectedly');
  END IF;

  -- 15b. Empty scores object '{}'::jsonb
  RESET ROLE;
  UPDATE public.evaluations SET scores = '{}'::jsonb WHERE id = v_eval_id;

  EXECUTE 'SET LOCAL ROLE authenticated';
  EXECUTE 'SET LOCAL "request.jwt.claims" TO ''' || v_claims || '''';

  v_passed := false;
  BEGIN
    PERFORM public.finalize_evaluation(v_eval_id);
    v_passed := true;
  EXCEPTION WHEN OTHERS THEN
    v_err := SQLERRM;
    IF v_err LIKE '%All criteria must be scored before finalizing%' THEN
      INSERT INTO test_results (test_name, status, details) VALUES ('15b. finalize with empty scores {} rejected', 'PASS', v_err);
    ELSE
      INSERT INTO test_results (test_name, status, details) VALUES ('15b. finalize with empty scores {} rejected', 'FAIL', 'Unexpected: ' || v_err);
    END IF;
  END;
  IF v_passed THEN
    INSERT INTO test_results (test_name, status, details) VALUES ('15b. finalize with empty scores {} rejected', 'FAIL', 'Succeeded unexpectedly');
  END IF;
END $$;


-- ============================================================================
-- TEST 16: finalize_evaluation JUDGING TIMING WINDOW CHECKS
-- ============================================================================
RESET ROLE;
DO $$
DECLARE
  v_eval_jf_id uuid;
  v_eval_jp_id uuid;
  v_judge_ai_id uuid;
  v_claims text;
  v_err text;
  v_passed boolean := false;
BEGIN
  SELECT val INTO v_eval_jf_id FROM temp_test_fixtures WHERE key = 'eval_jf_id';
  SELECT val INTO v_eval_jp_id FROM temp_test_fixtures WHERE key = 'eval_jp_id';
  SELECT val INTO v_judge_ai_id FROM temp_test_fixtures WHERE key = 'judge_ai_id';
  v_claims := '{"sub": "' || v_judge_ai_id || '", "role": "authenticated"}';

  EXECUTE 'SET LOCAL ROLE authenticated';
  EXECUTE 'SET LOCAL "request.jwt.claims" TO ''' || v_claims || '''';

  -- 16a. Before judging_starts_at
  BEGIN
    PERFORM public.finalize_evaluation(v_eval_jf_id);
    v_passed := true;
  EXCEPTION WHEN OTHERS THEN
    v_err := SQLERRM;
    IF v_err LIKE '%Judging period has not started yet%' THEN
      INSERT INTO test_results (test_name, status, details) VALUES ('16a. finalize before judging_starts_at rejected', 'PASS', v_err);
    ELSE
      INSERT INTO test_results (test_name, status, details) VALUES ('16a. finalize before judging_starts_at rejected', 'FAIL', 'Unexpected: ' || v_err);
    END IF;
  END;
  IF v_passed THEN
    INSERT INTO test_results (test_name, status, details) VALUES ('16a. finalize before judging_starts_at rejected', 'FAIL', 'Succeeded unexpectedly');
  END IF;

  -- 16b. After judging_ends_at
  v_passed := false;
  BEGIN
    PERFORM public.finalize_evaluation(v_eval_jp_id);
    v_passed := true;
  EXCEPTION WHEN OTHERS THEN
    v_err := SQLERRM;
    IF v_err LIKE '%Judging window has closed%' THEN
      INSERT INTO test_results (test_name, status, details) VALUES ('16b. finalize after judging_ends_at rejected', 'PASS', v_err);
    ELSE
      INSERT INTO test_results (test_name, status, details) VALUES ('16b. finalize after judging_ends_at rejected', 'FAIL', 'Unexpected: ' || v_err);
    END IF;
  END;
  IF v_passed THEN
    INSERT INTO test_results (test_name, status, details) VALUES ('16b. finalize after judging_ends_at rejected', 'FAIL', 'Succeeded unexpectedly');
  END IF;
END $$;


-- ============================================================================
-- TEST 17: SUCCESSFUL FINALIZATION BY ASSIGNED JUDGE
-- ============================================================================
RESET ROLE;
DO $$
DECLARE
  v_eval_id uuid;
  v_judge_ai_id uuid;
  v_claims text;
  v_eval_row record;
BEGIN
  SELECT val INTO v_eval_id FROM temp_test_fixtures WHERE key = 'eval_id';
  SELECT val INTO v_judge_ai_id FROM temp_test_fixtures WHERE key = 'judge_ai_id';
  v_claims := '{"sub": "' || v_judge_ai_id || '", "role": "authenticated"}';

  -- Populate complete numeric scores: 22 + 24 + 20 + 23 = 89
  UPDATE public.evaluations
  SET scores = '{"innovation": 22, "technical": 24, "impact": 20, "design": 23}'::jsonb
  WHERE id = v_eval_id;

  SELECT * INTO v_eval_row FROM public.evaluations WHERE id = v_eval_id;
  IF v_eval_row.total_score <> 89 THEN
    INSERT INTO test_results (test_name, status, details) VALUES ('17. compute score total', 'FAIL', 'Computed total was: ' || v_eval_row.total_score);
  ELSE
    INSERT INTO test_results (test_name, status, details) VALUES ('17. compute score total', 'PASS', 'Total is 89');
  END IF;

  EXECUTE 'SET LOCAL ROLE authenticated';
  EXECUTE 'SET LOCAL "request.jwt.claims" TO ''' || v_claims || '''';

  PERFORM public.finalize_evaluation(v_eval_id);

  RESET ROLE;
  SELECT * INTO v_eval_row FROM public.evaluations WHERE id = v_eval_id;
  IF v_eval_row.status = 'final' THEN
    INSERT INTO test_results (test_name, status, details) VALUES ('17. finalize_evaluation succeeded', 'PASS', 'Status is final');
  ELSE
    INSERT INTO test_results (test_name, status, details) VALUES ('17. finalize_evaluation succeeded', 'FAIL', 'Status was: ' || v_eval_row.status);
  END IF;
END $$;


-- ============================================================================
-- TEST 18: POST-FINALIZATION JUDGE RESTRICTIONS
-- ============================================================================
RESET ROLE;
DO $$
DECLARE
  v_eval_id uuid;
  v_judge_ai_id uuid;
  v_claims text;
  v_rows integer;
  v_status text;
  v_score numeric;
  v_err text;
  v_passed boolean := false;
BEGIN
  SELECT val INTO v_eval_id FROM temp_test_fixtures WHERE key = 'eval_id';
  SELECT val INTO v_judge_ai_id FROM temp_test_fixtures WHERE key = 'judge_ai_id';
  v_claims := '{"sub": "' || v_judge_ai_id || '", "role": "authenticated"}';

  EXECUTE 'SET LOCAL ROLE authenticated';
  EXECUTE 'SET LOCAL "request.jwt.claims" TO ''' || v_claims || '''';

  -- 18a. Judge attempts to update scores after final -> RLS filters row (ROW_COUNT = 0)
  UPDATE public.evaluations
  SET scores = '{"innovation": 25, "technical": 25, "impact": 25, "design": 25}'::jsonb
  WHERE id = v_eval_id;

  GET DIAGNOSTICS v_rows = ROW_COUNT;

  RESET ROLE;
  SELECT total_score INTO v_score FROM public.evaluations WHERE id = v_eval_id;

  IF v_rows = 0 AND v_score = 89 THEN
    INSERT INTO test_results (test_name, status, details) VALUES ('18a. post-final score edit blocked by RLS', 'PASS', '0 rows updated, score remains 89');
  ELSE
    INSERT INTO test_results (test_name, status, details) VALUES ('18a. post-final score edit blocked by RLS', 'FAIL', 'Rows updated: ' || v_rows || ', score: ' || v_score);
  END IF;

  -- 18b. Judge attempts to force status back to 'draft' -> RLS filters row (ROW_COUNT = 0), status unchanged
  EXECUTE 'SET LOCAL ROLE authenticated';
  EXECUTE 'SET LOCAL "request.jwt.claims" TO ''' || v_claims || '''';

  UPDATE public.evaluations
  SET status = 'draft'
  WHERE id = v_eval_id;

  GET DIAGNOSTICS v_rows = ROW_COUNT;

  RESET ROLE;
  SELECT status INTO v_status FROM public.evaluations WHERE id = v_eval_id;

  IF v_rows = 0 AND v_status = 'final' THEN
    INSERT INTO test_results (test_name, status, details) VALUES ('18b. post-final status downgrade blocked by RLS', 'PASS', '0 rows updated, status remains final');
  ELSE
    INSERT INTO test_results (test_name, status, details) VALUES ('18b. post-final status downgrade blocked by RLS', 'FAIL', 'Rows updated: ' || v_rows || ', status: ' || v_status);
  END IF;

  -- 18c. Calling finalize_evaluation on already finalized evaluation -> REJECTED
  EXECUTE 'SET LOCAL ROLE authenticated';
  EXECUTE 'SET LOCAL "request.jwt.claims" TO ''' || v_claims || '''';

  BEGIN
    PERFORM public.finalize_evaluation(v_eval_id);
    v_passed := true;
  EXCEPTION WHEN OTHERS THEN
    v_err := SQLERRM;
    IF v_err LIKE '%Evaluation has already been finalized%' THEN
      INSERT INTO test_results (test_name, status, details) VALUES ('18c. re-finalizing evaluation rejected', 'PASS', v_err);
    ELSE
      INSERT INTO test_results (test_name, status, details) VALUES ('18c. re-finalizing evaluation rejected', 'FAIL', 'Unexpected: ' || v_err);
    END IF;
  END;
  IF v_passed THEN
    INSERT INTO test_results (test_name, status, details) VALUES ('18c. re-finalizing evaluation rejected', 'FAIL', 'Succeeded unexpectedly');
  END IF;
END $$;


-- ============================================================================
-- SUMMARY & TEARDOWN VIA FORCED EXCEPTION
-- Rolls back all changes automatically while rendering results in Studio error panel.
-- ============================================================================
RESET ROLE;
RESET "request.jwt.claims";

DO $$
DECLARE
  v_total integer;
  v_fails integer;
  v_passes integer;
  v_summary text;
  v_header text;
BEGIN
  SELECT count(*), count(*) FILTER (WHERE status = 'FAIL'), count(*) FILTER (WHERE status = 'PASS')
  INTO v_total, v_fails, v_passes
  FROM test_results;

  SELECT string_agg(
    format('[%s] %s%s', 
      status, 
      test_name, 
      CASE WHEN details IS NOT NULL AND details <> '' THEN ': ' || details ELSE '' END
    ),
    E'\n' ORDER BY id
  )
  INTO v_summary
  FROM test_results;

  v_header := format(
    E'TOTAL FAILS: %s | PASSED: %s | TOTAL: %s\n' ||
    E'====================================================================',
    v_fails, v_passes, v_total
  );

  -- Raising an exception automatically rolls back the entire transaction,
  -- cleaning up all fixture accounts, while displaying the report in Studio.
  RAISE EXCEPTION E'\n[TEST SUITE COMPLETE] %\n%\n====================================================================\n(Transaction automatically rolled back; all fixtures dropped.)\n', 
    v_header, v_summary;
END $$;
