<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('vols', function (Blueprint $table) {
            $table->id('idVol');
            $table->datetime('dateHeure');
            $table->text('description');
            $table->text('objetsVoles');
            $table->string('photo1')->nullable();
            $table->string('photo2')->nullable();
            $table->string('photo3')->nullable();
            $table->string('photo4')->nullable();
            $table->string('photo5')->nullable();
            $table->string('photo6')->nullable();
            $table->enum('statut', ['en_attente', 'valide', 'rejete'])->default('en_attente');
            $table->unsignedBigInteger('idCamera');
            $table->unsignedBigInteger('idUtilisateur');
            $table->unsignedBigInteger('validePar')->nullable();
            $table->datetime('dateValidation')->nullable();
            $table->text('commentaireValidation')->nullable();
            $table->timestamps();

            $table->foreign('idCamera')->references('idCamera')->on('cameras');
            $table->foreign('idUtilisateur')->references('idUtilisateur')->on('users');
            $table->foreign('validePar')->references('idUtilisateur')->on('users');
        });
    }

    public function down()
    {
        Schema::dropIfExists('vols');
    }
};