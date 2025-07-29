<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('cameras', function (Blueprint $table) {
            $table->id('idCamera');
            $table->string('numeroSerie', 50)->unique();
            $table->string('adresseIP', 50)->unique();
            $table->string('zone', 100);
            $table->text('emplacement');
            $table->enum('statut', ['actif', 'panne', 'hors ligne'])->default('actif');
            $table->datetime('dateInstallation');
            $table->unsignedBigInteger('idTechnicien')->nullable();
            $table->timestamps();

            $table->foreign('idTechnicien')->references('idUtilisateur')->on('users');
        });
    }

    public function down()
    {
        Schema::dropIfExists('cameras');
    }
};