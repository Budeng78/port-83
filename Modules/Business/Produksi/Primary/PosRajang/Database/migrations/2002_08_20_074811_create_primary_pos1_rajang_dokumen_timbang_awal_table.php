<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('primary_pos1_rajang_dokumen_timbang_awal', function (Blueprint $table) {

            /*
            |--------------------------------------------------------------------------
            | Primary Key
            |--------------------------------------------------------------------------
            */
            $table->uuid('id')->primary();

            /*
            |--------------------------------------------------------------------------
            | Nomor Dokumen
            |--------------------------------------------------------------------------
            */
            $table->unsignedInteger('no');

            /*
            |--------------------------------------------------------------------------
            | Work Order
            |--------------------------------------------------------------------------
            */
            $table->string('no_wo', 50);

            /*
            |--------------------------------------------------------------------------
            | Identitas Material
            |--------------------------------------------------------------------------
            */
            $table->string('jenis', 50);
            $table->string('s_k', 50);

            /*
            |--------------------------------------------------------------------------
            | Tara
            |--------------------------------------------------------------------------
            |
            | Tara yang sudah ditentukan sebelum proses penimbangan.
            |
            */
            $table->decimal('tara', 10, 2);

            /*
            |--------------------------------------------------------------------------
            | Jumlah Bal
            |--------------------------------------------------------------------------
            */
            $table->unsignedInteger('jumlah_bal');

            /*
            |--------------------------------------------------------------------------
            | Status Proses Timbang
            |--------------------------------------------------------------------------
            */
            $table->enum('status', [
                'draft',
                'in_progress',
                'completed',
            ])->default('draft');

            /*
            |--------------------------------------------------------------------------
            | Audit / Blameable
            |--------------------------------------------------------------------------
            */
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->uuid('deleted_by')->nullable();

            /*
            |--------------------------------------------------------------------------
            | Timestamp & Soft Delete
            |--------------------------------------------------------------------------
            */
            $table->timestamps();
            $table->softDeletes();

            /*
            |--------------------------------------------------------------------------
            | Index
            |--------------------------------------------------------------------------
            */
            $table->index('no_wo');
            $table->index('status');
            $table->index([
                'no_wo',
                'jenis',
                's_k',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('primary_pos1_rajang_dokumen_timbang_awal');
    }
};