-- tenancy: the Team onboarding step (AUT-09) is built (identity invitations, V202611271200).
update onboarding_step set available = true where code = 'TEAM';
