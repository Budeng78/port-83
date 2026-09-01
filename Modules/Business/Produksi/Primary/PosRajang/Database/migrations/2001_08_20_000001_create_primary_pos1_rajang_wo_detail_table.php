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
        Schema::create('primary_pos1_rajang_wo_detail', function (Blueprint $table) {

            /*
            |--------------------------------------------------------------------------
            | PRIMARY KEY
            |--------------------------------------------------------------------------
            */

            $table->uuid('id')->primary();


            /*
            |--------------------------------------------------------------------------
            | RELASI WO HEADER
            |--------------------------------------------------------------------------
            */

            $table->uuid('wo_id');

            $table->foreign('wo_id')
                ->references('id')
                ->on('primary_pos1_rajang_wo')
                ->cascadeOnDelete();


            /*
            |--------------------------------------------------------------------------
            | INFORMASI DETAIL
            |--------------------------------------------------------------------------
            */

            $table->unsignedInteger('no_urut');

            $table->string('gudang', 100);

            $table->string('jenis_tbk', 100);

            $table->unsignedSmallInteger('tahun');

            $table->string('s_k', 100);

            $table->string('grade', 50);

            $table->unsignedInteger('jml_bal');


            /*
            |--------------------------------------------------------------------------
            | BERAT
            |--------------------------------------------------------------------------
            */

            $table->decimal('tara', 12, 2)
                ->default(0);

            $table->decimal('bruto', 12, 2)
                ->default(0);

            $table->decimal('netto', 12, 2)
                ->default(0);


            /*
            |--------------------------------------------------------------------------
            | AUDIT
            |--------------------------------------------------------------------------
            */

            $table->uuid('created_by')
                ->nullable();

            $table->uuid('updated_by')
                ->nullable();

            $table->uuid('deleted_by')
                ->nullable();


            /*
            |--------------------------------------------------------------------------
            | TIMESTAMPS
            |--------------------------------------------------------------------------
            */

            $table->timestamps();

            $table->softDeletes();


            /*
            |--------------------------------------------------------------------------
            | INDEX
            |--------------------------------------------------------------------------
            */

            $table->index('wo_id');

            $table->unique([
                'wo_id',
                'no_urut',
            ]);

        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('primary_pos1_rajang_wo_detail');
    }
};