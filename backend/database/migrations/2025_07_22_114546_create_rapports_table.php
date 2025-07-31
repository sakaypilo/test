<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('rapports', function (Blueprint $table) {
            $table->id('idRapport');
            $table->enum('typeRapport', ['incident', 'vol']);
            $table->text('contenu');
            $table->string('fichierPDF')->nullable();
            $table->datetime('dateCreation');
            $table->unsignedBigInteger('validePar');
            $table->unsignedBigInteger('idIncident')->nullable();
            $table->text('observations')->nullable();
            $table->timestamps();

            $table->foreign('validePar')->references('idUtilisateur')->on('users');
            $table->foreign('idIncident')->references('idIncident')->on('incidents');
        });
    }

    public function down()
    {
        Schema::dropIfExists('rapports');
    }
};