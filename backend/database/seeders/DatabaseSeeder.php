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
        // Créer les utilisateurs de test
        $admin = User::create([
            'matricule' => '2018001',
            'nom' => 'ADMIN',
            'prenom' => 'Système',
            'motDePasse' => 'admin123',
            'role' => 'admin',
            'email' => 'admin@smmc.mg',
            'telephone' => '+261 34 00 000 01',
            'actif' => true
        ]);

        $responsable = User::create([
            'matricule' => '2018025',
            'nom' => 'RAKOTO',
            'prenom' => 'Jean',
            'motDePasse' => 'password',
            'role' => 'responsable',
            'email' => 'jean.rakoto@smmc.mg',
            'telephone' => '+261 34 12 345 67',
            'actif' => true
        ]);

        $agent = User::create([
            'matricule' => '2020012',
            'nom' => 'RANDRIA',
            'prenom' => 'Marie',
            'motDePasse' => 'password',
            'role' => 'agent',
            'email' => 'marie.randria@smmc.mg',
            'telephone' => '+261 33 98 765 43',
            'actif' => true
        ]);

        $technicien = User::create([
            'matricule' => '2019008',
            'nom' => 'RAZAK',
            'prenom' => 'Ahmed',
            'motDePasse' => 'password',
            'role' => 'technicien',
            'email' => 'ahmed.razak@smmc.mg',
            'telephone' => '+261 32 11 223 44',
            'actif' => true
        ]);

        // Créer des caméras
        $camera1 = Camera::create([
            'numeroSerie' => 'CAM-001-2024',
            'adresseIP' => '192.168.1.101',
            'zone' => 'Zone Portuaire Nord',
            'emplacement' => 'Entrée principale - Portail 1',
            'statut' => 'actif',
            'dateInstallation' => '2024-01-15 08:00:00',
            'idTechnicien' => $technicien->idUtilisateur
        ]);

        $camera2 = Camera::create([
            'numeroSerie' => 'CAM-002-2024',
            'adresseIP' => '192.168.1.102',
            'zone' => 'Zone Portuaire Sud',
            'emplacement' => 'Quai conteneurs - Section A',
            'statut' => 'actif',
            'dateInstallation' => '2024-01-20 10:30:00',
            'idTechnicien' => $technicien->idUtilisateur
        ]);

        $camera3 = Camera::create([
            'numeroSerie' => 'CAM-003-2024',
            'adresseIP' => '192.168.1.103',
            'zone' => 'Zone Administrative',
            'emplacement' => 'Parking administration',
            'statut' => 'hors ligne',
            'dateInstallation' => '2024-02-01 14:15:00',
            'idTechnicien' => $technicien->idUtilisateur
        ]);

        // Créer des incidents
        $incident1 = Incident::create([
            'dateHeure' => '2024-01-15 14:30:00',
            'typeIncident' => 'Intrusion',
            'description' => 'Personne non autorisée détectée près du quai conteneurs',
            'zone' => 'Zone Portuaire Sud',
            'statut' => 'valide',
            'idCamera' => $camera2->idCamera,
            'idUtilisateur' => $agent->idUtilisateur,
            'validePar' => $responsable->idUtilisateur,
            'dateValidation' => '2024-01-15 15:00:00',
            'commentaireValidation' => 'Incident confirmé, mesures de sécurité renforcées'
        ]);

        $incident2 = Incident::create([
            'dateHeure' => '2024-01-16 09:15:00',
            'typeIncident' => 'Vol suspect',
            'description' => 'Activité suspecte observée dans la zone de stockage',
            'zone' => 'Zone Portuaire Nord',
            'statut' => 'en_attente',
            'idCamera' => $camera1->idCamera,
            'idUtilisateur' => $agent->idUtilisateur
        ]);

        // Créer des personnes appréhendées
        $personne1 = Personne::create([
            'nom' => 'RANDRIA',
            'prenom' => 'Paul',
            'CIN' => '123456789012',
            'statut' => 'externe'
        ]);

        $personne2 = Personne::create([
            'nom' => 'RAKOTO',
            'prenom' => 'Marie',
            'CIN' => '987654321098',
            'statut' => 'interne'
        ]);

        // Créer des interpellations
        Interpellation::create([
            'dateHeure' => '2024-01-15 14:30:00',
            'faitAssocie' => 'Tentative d\'intrusion dans la zone portuaire',
            'idPersonne' => $personne1->idPersonne,
            'idUtilisateur' => $agent->idUtilisateur
        ]);

        Interpellation::create([
            'dateHeure' => '2024-01-10 10:15:00',
            'faitAssocie' => 'Vol de matériel de bureau',
            'idPersonne' => $personne2->idPersonne,
            'idUtilisateur' => $agent->idUtilisateur
        ]);

        $this->command->info('Base de données initialisée avec succès !');
        $this->command->info('Utilisateurs créés :');
        $this->command->info('- Admin: 2018001 / admin123');
        $this->command->info('- Responsable: 2018025 / password');
        $this->command->info('- Agent: 2020012 / password');
        $this->command->info('- Technicien: 2019008 / password');
    }
}