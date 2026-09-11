<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('timbangan_pos1_timbang2', function (Blueprint $table) {

            $table->uuid('id')->primary();

            $table->uuid('target_id')
                ->index();

            $table->uuid('target_aturan_detail_id')
                ->nullable()
                ->index();

            $table->unsignedInteger('nomor_karung');

            $table->decimal('berat_kotor', 12, 2);

            $table->timestamps();

            $table->softDeletes();

            $table->index(
                [
                    'target_id',
                    'target_aturan_detail_id',
                ],
                't2_target_detail_idx'
            );

            $table->index(
                [
                    'target_aturan_detail_id',
                    'nomor_karung',
                ],
                't2_detail_karung_idx'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('timbangan_pos1_timbang2');
    }
};