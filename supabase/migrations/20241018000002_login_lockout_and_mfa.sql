-- 20241018000002_login_lockout_and_mfa.sql
-- Login attempts tracking for 10-minute lockout & TOTP MFA Factors

CREATE TABLE IF NOT EXISTS public.login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    attempt_time TIMESTAMPTZ DEFAULT now() NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    failure_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email_time 
ON public.login_attempts(email, attempt_time DESC);

CREATE TABLE IF NOT EXISTS public.mfa_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    secret TEXT NOT NULL,
    issuer TEXT DEFAULT 'YouTh Brain News' NOT NULL,
    is_verified BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mfa_factors_user_id 
ON public.mfa_factors(user_id);

-- Helper function to check if an account is locked out (3 consecutive failures within 10 minutes)
CREATE OR REPLACE FUNCTION public.check_account_lockout(p_email TEXT)
RETURNS TABLE (
    is_locked BOOLEAN,
    consecutive_failures INT,
    lockout_remaining_seconds INT
) AS $$
DECLARE
    v_last_success TIMESTAMPTZ;
    v_fail_count INT := 0;
    v_latest_failure TIMESTAMPTZ;
    v_lockout_window_seconds INT := 600; -- 10 minutes (600 seconds)
    v_elapsed_seconds INT;
BEGIN
    -- Find timestamp of most recent success
    SELECT attempt_time INTO v_last_success
    FROM public.login_attempts
    WHERE lower(email) = lower(p_email) AND success = true
    ORDER BY attempt_time DESC
    LIMIT 1;

    -- Count consecutive failures since that success (or all time if no success)
    SELECT count(*), max(attempt_time) INTO v_fail_count, v_latest_failure
    FROM public.login_attempts
    WHERE lower(email) = lower(p_email) 
      AND success = false
      AND (v_last_success IS NULL OR attempt_time > v_last_success);

    IF v_fail_count >= 3 AND v_latest_failure IS NOT NULL THEN
        v_elapsed_seconds := EXTRACT(EPOCH FROM (now() - v_latest_failure))::INT;
        IF v_elapsed_seconds < v_lockout_window_seconds THEN
            RETURN QUERY SELECT true, v_fail_count, (v_lockout_window_seconds - v_elapsed_seconds);
            RETURN;
        END IF;
    END IF;

    RETURN QUERY SELECT false, v_fail_count, 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
