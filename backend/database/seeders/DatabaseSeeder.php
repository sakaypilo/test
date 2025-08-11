<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Camera;
use App\Models\Incident;
use App\Models\Personne;
use App\Models\Interpellation;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $admin = User::updateOrCreate(
            ['matricule' => '2018001'],
            [
                'nom' => 'ADMIN',
                'prenom' => 'Système',
                'motDePasse' => 'admin123',
                'role' => 'admin',
                'email' => 'admin@smmc.mg',
                'telephone' => '+261 34 00 000 01',
                'actif' => true
            ]
        );

        $responsable = User::updateOrCreate(
            ['matricule' => '2018025'],
            [
                'nom' => 'RAKOTO',
                'prenom' => 'Jean',
                'motDePasse' => 'password',
                'role' => 'responsable',
                'email' => 'jean.rakoto@smmc.mg',
                'telephone' => '+261 34 12 345 67',
                'actif' => true
            ]
        );

        $agent = User::updateOrCreate(
            ['matricule' => '2020012'],
            [
                'nom' => 'RANDRIA',
                'prenom' => 'Marie',
                'motDePasse' => 'password',
                'role' => 'agent',
                'email' => 'marie.randria@smmc.mg',
                'telephone' => '+261 33 98 765 43',
                'actif' => true
            ]
        );

        $technicien = User::updateOrCreate(
            ['matricule' => '2019008'],
            [
                'nom' => 'RAZAK',
                'prenom' => 'Ahmed',
                'motDePasse' => 'password',
                'role' => 'technicien',
                'email' => 'ahmed.razak@smmc.mg',
                'telephone' => '+261 32 11 223 44',
                'actif' => true
            ]
        );

         // --- CAMERAS ---
        $camera1 = Camera::updateOrCreate(
            ['numeroSerie' => 'CAM-001-2024'], // clé unique
            [
                'adresseIP' => '192.168.1.101',
                'zone' => 'Zone Portuaire Nord',
                'emplacement' => 'Entrée principale - Portail 1',
                'statut' => 'actif',
                'dateInstallation' => '2024-01-15 08:00:00',
                'idTechnicien' => $technicien->idUtilisateur
            ]
        );

        $camera2 = Camera::updateOrCreate(
            ['numeroSerie' => 'CAM-002-2024'],
            [
                'adresseIP' => '192.168.1.102',
                'zone' => 'Zone Portuaire Sud',
                'emplacement' => 'Quai conteneurs - Section A',
                'statut' => 'actif',
                'dateInstallation' => '2024-01-20 10:30:00',
                'idTechnicien' => $technicien->idUtilisateur
            ]
        );

        $camera3 = Camera::updateOrCreate(
            ['numeroSerie' => 'CAM-003-2024'],
            [
                'adresseIP' => '192.168.1.103',
                'zone' => 'Zone Administrative',
                'emplacement' => 'Parking administration',
                'statut' => 'hors ligne',
                'dateInstallation' => '2024-02-01 14:15:00',
                'idTechnicien' => $technicien->idUtilisateur
            ]
        );

        // --- INCIDENTS ---
        $incident1 = Incident::updateOrCreate(
            [
                'dateHeure' => '2024-01-15 14:30:00',
                'typeIncident' => 'Intrusion'
            ],
            [
                'description' => 'Personne non autorisée détectée près du quai conteneurs',
                'zone' => 'Zone Portuaire Sud',
                'statut' => 'valide',
                'idCamera' => $camera2->idCamera,
                'idUtilisateur' => $agent->idUtilisateur,
                'validePar' => $responsable->idUtilisateur,
                'dateValidation' => '2024-01-15 15:00:00',
                'commentaireValidation' => 'Incident confirmé, mesures de sécurité renforcées'
            ]
        );

        $incident2 = Incident::updateOrCreate(
            [
                'dateHeure' => '2024-01-16 09:15:00',
                'typeIncident' => 'Vol suspect'
            ],
            [
                'description' => 'Activité suspecte observée dans la zone de stockage',
                'zone' => 'Zone Portuaire Nord',
                'statut' => 'en_attente',
                'idCamera' => $camera1->idCamera,
                'idUtilisateur' => $agent->idUtilisateur
            ]
        );

        // --- PERSONNES ---
        $personne1 = Personne::updateOrCreate(
            ['CIN' => '123456789012'],
            [
                'nom' => 'RANDRIA',
                'prenom' => 'Paul',
                'statut' => 'externe'
            ]
        );

        $personne2 = Personne::updateOrCreate(
            ['CIN' => '987654321098'],
            [
                'nom' => 'RAKOTO',
                'prenom' => 'Marie',
                'statut' => 'interne'
            ]
        );

        // --- INTERPELLATIONS ---
        Interpellation::updateOrCreate(
            [
                'dateHeure' => '2024-01-15 14:30:00',
                'idPersonne' => $personne1->idPersonne
            ],
            [
                'faitAssocie' => 'Tentative d\'intrusion dans la zone portuaire',
                'idUtilisateur' => $agent->idUtilisateur
            ]
        );

        Interpellation::updateOrCreate(
            [
                'dateHeure' => '2024-01-10 10:15:00',
                'idPersonne' => $personne2->idPersonne
            ],
            [
                'faitAssocie' => 'Vol de matériel de bureau',
                'idUtilisateur' => $agent->idUtilisateur
            ]
        );

        $this->command->info('Base de données initialisée avec succès !');
        $this->command->info('Utilisateurs créés :');
        $this->command->info('- Admin: 2018001 / admin123');
        $this->command->info('- Responsable: 2018025 / password');
        $this->command->info('- Agent: 2020012 / password');
        $this->command->info('- Technicien: 2019008 / password');
    }
}