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
            'primary_pos1_rajang_dokumen_timbang_awal_detail_cache',
            function (Blueprint $table) {

                /*
                |--------------------------------------------------------------------------
                | Primary Key
                |--------------------------------------------------------------------------
                */
                $table->uuid('id')->primary();

                /*
                |--------------------------------------------------------------------------
                | Relasi ke Header Dokumen Timbang Awal
                |--------------------------------------------------------------------------
                */
                $table->uuid('dokumen_timbang_awal_id');

                /*
                |--------------------------------------------------------------------------
                | Nomor Tally / Nomor Bal
                |--------------------------------------------------------------------------
                |
                | 1 nomor tally = 1 bal = 1 hasil timbang.
                |
                */
                $table->unsignedInteger('nomor_tally');

                /*
                |--------------------------------------------------------------------------
                | Berat Bruto
                |--------------------------------------------------------------------------
                |
                | Nilai berat yang diterima dari MQTT timbangan.
                |
                */
                $table->decimal('berat_bruto', 10, 2);

                /*
                |--------------------------------------------------------------------------
                | Tara
                |--------------------------------------------------------------------------
                |
                | Tara yang digunakan pada saat proses penimbangan.
                |
                */
                $table->decimal('tara', 10, 2);

                /*
                |--------------------------------------------------------------------------
                | Berat Netto
                |--------------------------------------------------------------------------
                |
                | Netto = Berat Bruto - Tara
                |
                */
                $table->decimal('berat_netto', 10, 2);

                /*
                |--------------------------------------------------------------------------
                | Waktu Timbang
                |--------------------------------------------------------------------------
                |
                | Waktu ketika berat diterima dari timbangan.
                |
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
                |
                | Nama index dibuat pendek karena nama tabel sangat panjang.
                |
                */
                $table->index(
                    'dokumen_timbang_awal_id',
                    'dtaw_cache_dokumen_idx'
                );

                $table->index(
                    'nomor_tally',
                    'dtaw_cache_nomor_idx'
                );

                /*
                |--------------------------------------------------------------------------
                | Unique Tally
                |--------------------------------------------------------------------------
                |
                | Dalam satu dokumen timbang,
                | satu nomor tally hanya boleh muncul satu kali.
                |
                */
                $table->unique(
                    [
                        'dokumen_timbang_awal_id',
                        'nomor_tally',
                    ],
                    'dtaw_cache_unique'
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
            'primary_pos1_rajang_dokumen_timbang_awal_detail_cache'
        );
    }
};
