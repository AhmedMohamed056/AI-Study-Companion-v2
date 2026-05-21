# Supabase Setup Guide

## Getting Your Database Connection String

1. Go to your Supabase project: https://app.supabase.com
2. Click on your project: **eduovjbtvjlywmljceko**
3. Go to **Settings** → **Database**
4. Under "Connection string", select **PostgreSQL**
5. Copy the connection string
6. Replace `[YOUR-PASSWORD]` with your database password

## Your Connection Details

**Project Reference:** eduovjbtvjlywmljceko  
**Database Host:** db.eduovjbtvjlywmljceko.supabase.co  
**Database Name:** postgres  
**Database User:** postgres.eduovjbtvjlywmljceko  

## Update .env File

Edit `backend/.env` and update:

```
DATABASE_URL=postgresql://postgres.eduovjbtvjlywmljceko:[YOUR-PASSWORD]@db.eduovjbtvjlywmljceko.supabase.co:5432/postgres
```

Replace `[YOUR-PASSWORD]` with your actual database password from Supabase.

## Verify Connection

Once you've updated the password, run:

```bash
cd backend
npx prisma db push
```

This will create all the tables in your database.

## Next Steps

1. Update DATABASE_URL in backend/.env with your password
2. Run: `npx prisma migrate dev --name init`
3. Start the servers: `npm run dev` in both folders
