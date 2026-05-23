DROP TABLE IF EXISTS public.notes;

CREATE TYPE public.weight_entry_tag AS ENUM (
	'late_dinner',
	'alcohol',
	'training',
	'illness',
	'travel',
	'other'
);

CREATE TYPE public.weight_goal_status AS ENUM (
	'active',
	'archived',
	'reached'
);

CREATE TABLE public.weight_entries (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
	date DATE NOT NULL,
	morning_weight_kg NUMERIC(5, 2),
	evening_weight_kg NUMERIC(5, 2),
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	CONSTRAINT weight_entries_one_value_present CHECK (
		morning_weight_kg IS NOT NULL OR evening_weight_kg IS NOT NULL
	),
	CONSTRAINT weight_entries_morning_positive CHECK (morning_weight_kg IS NULL OR morning_weight_kg > 0),
	CONSTRAINT weight_entries_evening_positive CHECK (evening_weight_kg IS NULL OR evening_weight_kg > 0),
	CONSTRAINT weight_entries_user_date_unique UNIQUE (user_id, date)
);

CREATE TABLE public.weight_entry_tags (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
	weight_entry_id UUID NOT NULL REFERENCES public.weight_entries(id) ON DELETE CASCADE,
	tag public.weight_entry_tag NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	CONSTRAINT weight_entry_tags_unique UNIQUE (weight_entry_id, tag)
);

CREATE TABLE public.body_measurements (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
	date DATE NOT NULL,
	chest_cm NUMERIC(5, 2),
	waist_cm NUMERIC(5, 2),
	hips_cm NUMERIC(5, 2),
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	CONSTRAINT body_measurements_one_value_present CHECK (
		chest_cm IS NOT NULL OR waist_cm IS NOT NULL OR hips_cm IS NOT NULL
	),
	CONSTRAINT body_measurements_chest_positive CHECK (chest_cm IS NULL OR chest_cm > 0),
	CONSTRAINT body_measurements_waist_positive CHECK (waist_cm IS NULL OR waist_cm > 0),
	CONSTRAINT body_measurements_hips_positive CHECK (hips_cm IS NULL OR hips_cm > 0),
	CONSTRAINT body_measurements_user_date_unique UNIQUE (user_id, date)
);

CREATE TABLE public.weight_goals (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
	start_date DATE NOT NULL,
	start_weight_kg NUMERIC(5, 2) NOT NULL,
	target_weight_kg NUMERIC(5, 2) NOT NULL,
	weekly_loss_kg NUMERIC(4, 2) NOT NULL DEFAULT 0.5,
	calculated_target_date DATE NOT NULL,
	status public.weight_goal_status NOT NULL DEFAULT 'active',
	revision_of_goal_id UUID REFERENCES public.weight_goals(id) ON DELETE SET NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	CONSTRAINT weight_goals_start_positive CHECK (start_weight_kg > 0),
	CONSTRAINT weight_goals_target_positive CHECK (target_weight_kg > 0),
	CONSTRAINT weight_goals_weekly_loss_positive CHECK (weekly_loss_kg > 0),
	CONSTRAINT weight_goals_target_below_start CHECK (target_weight_kg < start_weight_kg)
);

CREATE UNIQUE INDEX weight_goals_one_active_per_user_idx
	ON public.weight_goals(user_id)
	WHERE status = 'active';

CREATE INDEX weight_entries_user_date_idx ON public.weight_entries(user_id, date DESC);
CREATE INDEX weight_entry_tags_entry_idx ON public.weight_entry_tags(weight_entry_id);
CREATE INDEX body_measurements_user_date_idx ON public.body_measurements(user_id, date DESC);
CREATE INDEX weight_goals_user_status_idx ON public.weight_goals(user_id, status, start_date DESC);

CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = now();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_weight_entries_updated_at
	BEFORE UPDATE ON public.weight_entries
	FOR EACH ROW
	EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER set_body_measurements_updated_at
	BEFORE UPDATE ON public.body_measurements
	FOR EACH ROW
	EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER set_weight_goals_updated_at
	BEFORE UPDATE ON public.weight_goals
	FOR EACH ROW
	EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE OR REPLACE FUNCTION public.ensure_weight_entry_tag_user_id()
RETURNS TRIGGER AS $$
DECLARE
	entry_user_id UUID;
BEGIN
	SELECT user_id INTO entry_user_id
	FROM public.weight_entries
	WHERE id = NEW.weight_entry_id;

	IF entry_user_id IS NULL THEN
		RAISE EXCEPTION 'weight entry does not exist';
	END IF;

	IF NEW.user_id <> entry_user_id THEN
		RAISE EXCEPTION 'tag user_id must match weight entry user_id';
	END IF;

	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_weight_entry_tag_user_id
	BEFORE INSERT OR UPDATE ON public.weight_entry_tags
	FOR EACH ROW
	EXECUTE FUNCTION public.ensure_weight_entry_tag_user_id();

CREATE OR REPLACE FUNCTION public.upsert_weight_entry_with_tags(
	p_date DATE,
	p_morning_weight_kg NUMERIC DEFAULT NULL,
	p_evening_weight_kg NUMERIC DEFAULT NULL,
	p_tags public.weight_entry_tag[] DEFAULT '{}'::public.weight_entry_tag[]
)
RETURNS UUID AS $$
DECLARE
	current_user_id UUID := auth.uid();
	entry_id UUID;
BEGIN
	IF current_user_id IS NULL THEN
		RAISE EXCEPTION 'not authenticated';
	END IF;

	INSERT INTO public.weight_entries (
		user_id,
		date,
		morning_weight_kg,
		evening_weight_kg
	)
	VALUES (
		current_user_id,
		p_date,
		p_morning_weight_kg,
		p_evening_weight_kg
	)
	ON CONFLICT (user_id, date)
	DO UPDATE SET
		morning_weight_kg = EXCLUDED.morning_weight_kg,
		evening_weight_kg = EXCLUDED.evening_weight_kg
	RETURNING id INTO entry_id;

	DELETE FROM public.weight_entry_tags
	WHERE weight_entry_id = entry_id
		AND user_id = current_user_id;

	INSERT INTO public.weight_entry_tags (user_id, weight_entry_id, tag)
	SELECT current_user_id, entry_id, tag
	FROM unnest(p_tags) AS tag
	ON CONFLICT (weight_entry_id, tag) DO NOTHING;

	RETURN entry_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.create_weight_goal_revision(
	p_start_date DATE,
	p_start_weight_kg NUMERIC,
	p_target_weight_kg NUMERIC
)
RETURNS UUID AS $$
DECLARE
	current_user_id UUID := auth.uid();
	active_goal_id UUID;
	new_goal_id UUID;
	weekly_loss NUMERIC := 0.5;
	target_date DATE;
BEGIN
	IF current_user_id IS NULL THEN
		RAISE EXCEPTION 'not authenticated';
	END IF;

	target_date := p_start_date + GREATEST(
		0,
		CEIL((p_start_weight_kg - p_target_weight_kg) / (weekly_loss / 7))::INTEGER
	);

	SELECT id INTO active_goal_id
	FROM public.weight_goals
	WHERE user_id = current_user_id
		AND status = 'active'
	LIMIT 1;

	UPDATE public.weight_goals
	SET status = 'archived'
	WHERE id = active_goal_id
		AND user_id = current_user_id;

	INSERT INTO public.weight_goals (
		user_id,
		start_date,
		start_weight_kg,
		target_weight_kg,
		weekly_loss_kg,
		calculated_target_date,
		status,
		revision_of_goal_id
	)
	VALUES (
		current_user_id,
		p_start_date,
		p_start_weight_kg,
		p_target_weight_kg,
		weekly_loss,
		target_date,
		'active',
		active_goal_id
	)
	RETURNING id INTO new_goal_id;

	RETURN new_goal_id;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE public.weight_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_entry_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can read their own weight entries"
	ON public.weight_entries
	FOR SELECT
	USING (auth.uid() = user_id);

CREATE POLICY "users can insert their own weight entries"
	ON public.weight_entries
	FOR INSERT
	WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can update their own weight entries"
	ON public.weight_entries
	FOR UPDATE
	USING (auth.uid() = user_id)
	WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can delete their own weight entries"
	ON public.weight_entries
	FOR DELETE
	USING (auth.uid() = user_id);

CREATE POLICY "users can read their own weight entry tags"
	ON public.weight_entry_tags
	FOR SELECT
	USING (auth.uid() = user_id);

CREATE POLICY "users can insert their own weight entry tags"
	ON public.weight_entry_tags
	FOR INSERT
	WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can update their own weight entry tags"
	ON public.weight_entry_tags
	FOR UPDATE
	USING (auth.uid() = user_id)
	WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can delete their own weight entry tags"
	ON public.weight_entry_tags
	FOR DELETE
	USING (auth.uid() = user_id);

CREATE POLICY "users can read their own body measurements"
	ON public.body_measurements
	FOR SELECT
	USING (auth.uid() = user_id);

CREATE POLICY "users can insert their own body measurements"
	ON public.body_measurements
	FOR INSERT
	WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can update their own body measurements"
	ON public.body_measurements
	FOR UPDATE
	USING (auth.uid() = user_id)
	WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can delete their own body measurements"
	ON public.body_measurements
	FOR DELETE
	USING (auth.uid() = user_id);

CREATE POLICY "users can read their own weight goals"
	ON public.weight_goals
	FOR SELECT
	USING (auth.uid() = user_id);

CREATE POLICY "users can insert their own weight goals"
	ON public.weight_goals
	FOR INSERT
	WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can update their own weight goals"
	ON public.weight_goals
	FOR UPDATE
	USING (auth.uid() = user_id)
	WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can delete their own weight goals"
	ON public.weight_goals
	FOR DELETE
	USING (auth.uid() = user_id);
