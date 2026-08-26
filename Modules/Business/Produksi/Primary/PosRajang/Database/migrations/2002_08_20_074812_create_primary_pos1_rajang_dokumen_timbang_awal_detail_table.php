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
        Schema::create(
            'primary_pos1_rajang_dokumen_timbang_awal_detail',
            function (Blueprint $table) {

                /*
                |--------------------------------------------------------------------------
                | Primary Key
                |--------------------------------------------------------------------------
                */
                $table->uuid('id')->primary();

                /*
                |--------------------------------------------------------------------------
                | Relasi ke Header
                |--------------------------------------------------------------------------
                */
                $table->uuid('dokumen_timbang_awal_id');

                /*
                |--------------------------------------------------------------------------
                | Nomor Tally / Bal
                |--------------------------------------------------------------------------
                */
                $table->unsignedInteger('nomor_tally');

                /*
                |--------------------------------------------------------------------------
                | Berat Bruto
                |--------------------------------------------------------------------------
                */
                $table->decimal('berat_bruto', 10, 2);

                /*
                |--------------------------------------------------------------------------
                | Tara
                |--------------------------------------------------------------------------
                */
                $table->decimal('tara', 10, 2);

                /*
                |--------------------------------------------------------------------------
                | Berat Netto
                |--------------------------------------------------------------------------
                */
                $table->decimal('berat_netto', 10, 2);

                /*
                |--------------------------------------------------------------------------
                | Waktu Timbang
                |--------------------------------------------------------------------------
                */
                $table->timestamp('waktu_timbang')->nullable();

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
                $table->index(
                    'dokumen_timbang_awal_id',
                    'dtaw_detail_dokumen_idx'
                );

                $table->index(
                    'nomor_tally',
                    'dtaw_detail_nomor_idx'
                );

                /*
                |--------------------------------------------------------------------------
                | Satu nomor tally hanya boleh satu kali
                | dalam satu dokumen timbang.
                |--------------------------------------------------------------------------
                */
                $table->unique(
                    [
                        'dokumen_timbang_awal_id',
                        'nomor_tally',
                    ],
                    'dtaw_detail_unique'
                );
            }
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists(
            'primary_pos1_rajang_dokumen_timbang_awal_detail'
        );
    }
};