# Supabase Auth Role Setup

Use one of these role values in the user's metadata:

- `super_admin`
- `boss`
- `hr_manager`
- `department_manager`
- `employee`

Recommended user metadata shape:

```json
{
  "full_name": "Sarah Wong",
  "role": "hr_manager"
}
```

If you assign roles from the Supabase dashboard:

1. Open Authentication > Users.
2. Select a user.
3. Edit the user metadata.
4. Set `role` to one of the values above.
5. Save and ask the user to sign in again.

Current route access summary:

- `super_admin`: all routes
- `boss`: all business routes and admin
- `hr_manager`: people, inbox, attendance, leaves, payroll, admin, settings, onboarding, offboarding
- `department_manager`: people, inbox, attendance, leaves
- `employee`: inbox, attendance, leaves