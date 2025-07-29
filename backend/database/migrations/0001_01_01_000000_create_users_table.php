<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id('idUtilisateur');
            $table->string('matricule', 10)->unique();
            $table->string('nom', 50);
            $table->string('prenom', 50);
            $table->string('motDePasse');
            $table->enum('role', ['admin', 'agent', 'technicien', 'responsable']);
            $table->string('email', 100)->unique();
            $table->string('telephone', 20)->nullable();
            $table->boolean('actif')->default(true);
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
};