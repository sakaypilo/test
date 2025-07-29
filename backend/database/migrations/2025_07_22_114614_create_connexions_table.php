<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('connexions', function (Blueprint $table) {
            $table->id('idConnexion');
            $table->datetime('dateHeure');
            $table->string('adresseIP', 50);
            $table->boolean('succes')->default(true);
            $table->string('userAgent')->nullable();
            $table->unsignedBigInteger('idUtilisateur');
            $table->timestamps();

            $table->foreign('idUtilisateur')->references('idUtilisateur')->on('users');
        });
    }

    public function down()
    {
        Schema::dropIfExists('connexions');
    }
};