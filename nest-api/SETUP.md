# Setup Instructions

Follow these steps to get the NestJS API running!

## 1. Install Dependencies
```bash
cd /home/sakay/Images/GestionCameraIncidentVol/testSmmc1/nest-api
npm install
```

## 2. Pull Database Schema from Laravel DB
Since you already have a Laravel database, we need to pull its schema for Prisma to use!
```bash
npx prisma db pull
```
This will update prisma/schema.prisma to exactly match your existing Laravel database!

## 3. Generate Prisma Client
```bash
npx prisma generate
```
This generates the type-safe Prisma Client for NestJS!

## 4. Start the Server
```bash
npm run start:dev
```
Your NestJS API is now running at http://localhost:3001/api!

## 5. Test the Connection
Both frontend (React) and mobile (React Native) apps should now automatically use the new NestJS API!

## Notes
- The API contract is exactly the same as your original Laravel API!
- All endpoints have the same parameters and response structure!
- File uploads (photos for incidents and personnes) are now handled by NestJS!
- Static files (photos) are served at /storage/...!
