<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('timbangan_pos1_target_aturan', function (Blueprint $table) {

            $table->uuid('id')->primary();


            $table->foreignUuid('target_id')
                ->constrained('timbangan_pos1_target')
                ->cascadeOnDelete();


            $table->string('nomor_aturan', 100);


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
        Schema::dropIfExists('timbangan_pos1_target_aturan');
    }
};