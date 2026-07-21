# Steps to fix and run your NestJS API!

1. Go to the NestJS project directory
```bash
cd /home/sakay/Images/GestionCameraIncidentVol/testSmmc1/nest-api
```

2. Install dependencies
```bash
npm install
```

3. Generate Prisma Client
```bash
npx prisma generate
```

4. Optional: Pull your existing database schema to make 100% sure it's correct!
```bash
npx prisma db pull
```

5. Run your NestJS server in development mode!
```bash
npm run start:dev
```

That's it! Your API will now be running at http://localhost:3001/api!
