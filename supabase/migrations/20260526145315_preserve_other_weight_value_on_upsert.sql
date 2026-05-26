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
		morning_weight_kg = COALESCE(EXCLUDED.morning_weight_kg, public.weight_entries.morning_weight_kg),
		evening_weight_kg = COALESCE(EXCLUDED.evening_weight_kg, public.weight_entries.evening_weight_kg)
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
