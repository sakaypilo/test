<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('personnes', function (Blueprint $table) {
            $table->id('idPersonne');
            $table->string('nom', 50);
            $table->string('prenom', 50);
            $table->string('CIN', 20)->unique();
            $table->enum('statut', ['interne', 'externe']);
            $table->string('photo')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('personnes');
    }
};