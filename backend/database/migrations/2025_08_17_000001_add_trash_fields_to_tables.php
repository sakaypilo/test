<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Ajouter les champs de corbeille aux incidents
        Schema::table('incidents', function (Blueprint $table) {
            $table->timestamp('deleted_at')->nullable();
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->text('deletion_reason')->nullable();
            $table->timestamp('restored_at')->nullable();
            $table->unsignedBigInteger('restored_by')->nullable();
            
            $table->foreign('deleted_by')->references('idUtilisateur')->on('users');
            $table->foreign('restored_by')->references('idUtilisateur')->on('users');
        });

        // Ajouter les champs de corbeille aux caméras
        Schema::table('cameras', function (Blueprint $table) {
            $table->boolean('actif')->default(true);
            $table->timestamp('deleted_at')->nullable();
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->text('deletion_reason')->nullable();
            $table->timestamp('restored_at')->nullable();
            $table->unsignedBigInteger('restored_by')->nullable();
            
            $table->foreign('deleted_by')->references('idUtilisateur')->on('users');
            $table->foreign('restored_by')->references('idUtilisateur')->on('users');
        });

        // Les personnes ont déjà le champ 'actif', ajouter les autres
        Schema::table('personnes', function (Blueprint $table) {
            $table->timestamp('deleted_at')->nullable();
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->text('deletion_reason')->nullable();
            $table->timestamp('restored_at')->nullable();
            $table->unsignedBigInteger('restored_by')->nullable();
            
            $table->foreign('deleted_by')->references('idUtilisateur')->on('users');
            $table->foreign('restored_by')->references('idUtilisateur')->on('users');
        });

        // Ajouter les champs de corbeille aux vols
        Schema::table('vols', function (Blueprint $table) {
            $table->boolean('actif')->default(true);
            $table->timestamp('deleted_at')->nullable();
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->text('deletion_reason')->nullable();
            $table->timestamp('restored_at')->nullable();
            $table->unsignedBigInteger('restored_by')->nullable();
            
            $table->foreign('deleted_by')->references('idUtilisateur')->on('users');
            $table->foreign('restored_by')->references('idUtilisateur')->on('users');
        });

        // Les utilisateurs ont déjà le champ 'actif', ajouter les autres
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('deleted_at')->nullable();
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->text('deletion_reason')->nullable();
            $table->timestamp('restored_at')->nullable();
            $table->unsignedBigInteger('restored_by')->nullable();
            
            $table->foreign('deleted_by')->references('idUtilisateur')->on('users');
            $table->foreign('restored_by')->references('idUtilisateur')->on('users');
        });
    }

    public function down()
    {
        Schema::table('incidents', function (Blueprint $table) {
            $table->dropForeign(['deleted_by']);
            $table->dropForeign(['restored_by']);
            $table->dropColumn(['deleted_at', 'deleted_by', 'deletion_reason', 'restored_at', 'restored_by']);
        });

        Schema::table('cameras', function (Blueprint $table) {
            $table->dropForeign(['deleted_by']);
            $table->dropForeign(['restored_by']);
            $table->dropColumn(['actif', 'deleted_at', 'deleted_by', 'deletion_reason', 'restored_at', 'restored_by']);
        });

        Schema::table('personnes', function (Blueprint $table) {
            $table->dropForeign(['deleted_by']);
            $table->dropForeign(['restored_by']);
            $table->dropColumn(['deleted_at', 'deleted_by', 'deletion_reason', 'restored_at', 'restored_by']);
        });

        Schema::table('vols', function (Blueprint $table) {
            $table->dropForeign(['deleted_by']);
            $table->dropForeign(['restored_by']);
            $table->dropColumn(['actif', 'deleted_at', 'deleted_by', 'deletion_reason', 'restored_at', 'restored_by']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['deleted_by']);
            $table->dropForeign(['restored_by']);
            $table->dropColumn(['deleted_at', 'deleted_by', 'deletion_reason', 'restored_at', 'restored_by']);
        });
    }
};
