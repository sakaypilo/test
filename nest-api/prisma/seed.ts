import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      matricule: '1234567',
      nom: 'Admin',
      prenom: 'SMMC',
      motDePasse: hashedPassword,
      role: 'admin',
      email: 'admin@smmc.mg',
      telephone: '0341234567',
      actif: true,
    },
  });

  console.log('Created admin user:', admin.matricule);

  // Create camera
  const camera = await prisma.camera.create({
    data: {
      numeroSerie: 'CAM001',
      adresseIP: '192.168.1.100',
      zone: 'Zone 1',
      emplacement: 'Entrée principale',
      statut: 'actif',
      dateInstallation: new Date(),
      idTechnicien: admin.idUtilisateur,
      actif: true,
    },
  });

  console.log('Created camera:', camera.numeroSerie);

  // Create incident
  const incident = await prisma.incident.create({
    data: {
      dateHeure: new Date(),
      typeIncident: 'Intrusion',
      description: 'Personne non autorisée détectée à l\'entrée',
      zone: 'Zone 1',
      statut: 'en_attente',
      idCamera: camera.idCamera,
      idUtilisateur: admin.idUtilisateur,
      actif: true,
    },
  });

  console.log('Created incident:', incident.idIncident);

  // Create personne
  const personne = await prisma.personne.create({
    data: {
      nom: 'Doe',
      prenom: 'John',
      CIN: '1234567890',
      statut: 'interne',
      actif: true,
    },
  });

  console.log('Created personne:', personne.CIN);

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
