<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::create('timbangan_pos1_target_aturan_detail', function (Blueprint $table) {

            $table->uuid('id')->primary();


            $table->foreignUuid('target_aturan_id')
                ->constrained('timbangan_pos1_target_aturan')
                ->cascadeOnDelete();



            $table->enum('type', [
                'krosok',
                'precut'
            ]);


            $table->string('jenis_tbk', 100);

            $table->string('tahun', 20);

            $table->string('grade', 100);

            $table->string('s_k', 10);

            $table->unsignedInteger('jumlah_bal');
            $table->decimal('berat_bruto', 10, 2);
            $table->decimal('tara', 10, 2);
            $table->enum('status', [
                'pending',
                'active',
                'finish',
            ])->default('pending');



            // audit BaseModel
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->uuid('deleted_by')->nullable();


            $table->timestamps();
            $table->softDeletes();

        });
    }


    public function down(): void
    {
        Schema::dropIfExists('timbangan_pos1_target_aturan_detail');
    }

};