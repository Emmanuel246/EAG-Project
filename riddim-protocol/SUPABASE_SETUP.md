# Supabase setup for Riddim Protocol

This project is built as a hackathon prototype and is designed to support a real off-chain data layer through Supabase while remaining honest about demo logic when credentials are not configured.

## 1. Create a Supabase project

1. Sign in to Supabase.
2. Create a new project.
3. Copy the project URL and anon key.
4. Add them to your local environment:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

## 2. Apply the schema

Open the SQL editor in Supabase and run the schema from:

- `supabase/schema.sql`

That script creates the tables used by the prototype:

- `profiles`
- `riddims`
- `license_matches`
- `tips`
- `platform_integrations`

## 3. Enable storage

If you want to use Cloudinary or Supabase Storage for uploaded demo assets:

- enable storage in Supabase
- configure a bucket named `media` or adjust the bucket names in the app logic

## 4. App behavior

The app will:

- use Supabase when environment values are present
- automatically fall back to demo data when the environment is not configured
- keep the UI honest about what is live vs demo-backed data

## 5. Important note

This is still a prototype. The data layer is real-ready, but the actual service connection depends on your own Supabase project credentials and environment setup.
