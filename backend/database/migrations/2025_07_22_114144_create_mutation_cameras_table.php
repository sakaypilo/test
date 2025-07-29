<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('mutation_cameras', function (Blueprint $table) {
            $table->id('idMutation');
            $table->datetime('dateHeureMutation');
            $table->text('ancienEmplacement');
            $table->text('nouvelEmplacement');
            $table->text('motif');
            $table->unsignedBigInteger('idCamera');
            $table->unsignedBigInteger('idTechnicien');
            $table->timestamps();

            $table->foreign('idCamera')->references('idCamera')->on('cameras');
            $table->foreign('idTechnicien')->references('idUtilisateur')->on('users');
        });
    }

    public function down()
    {
        Schema::dropIfExists('mutation_cameras');
    }
};