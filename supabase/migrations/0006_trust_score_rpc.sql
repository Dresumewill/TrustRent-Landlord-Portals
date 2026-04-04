-- RPC to safely increment a user's trust_score, capped at 5.0
create or replace function increment_trust_score(user_id uuid, delta numeric)
returns void
language plpgsql
security definer
as $$
begin
  update users
  set trust_score = least(5.0, coalesce(trust_score, 0) + delta)
  where id = user_id;
end;
$$;
