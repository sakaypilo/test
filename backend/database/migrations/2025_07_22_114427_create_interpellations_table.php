<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('interpellations', function (Blueprint $table) {
            $table->id('idInterpellation');
            $table->datetime('dateHeure');
            $table->text('faitAssocie');
            $table->unsignedBigInteger('idPersonne');
            $table->unsignedBigInteger('idUtilisateur');
            $table->timestamps();

            $table->foreign('idPersonne')->references('idPersonne')->on('personnes');
            $table->foreign('idUtilisateur')->references('idUtilisateur')->on('users');
        });
    }

    public function down()
    {
        Schema::dropIfExists('interpellations');
    }
};