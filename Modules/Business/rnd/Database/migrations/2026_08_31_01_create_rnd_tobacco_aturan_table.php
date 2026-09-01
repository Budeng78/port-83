<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rnd_tobacco_aturan', function (Blueprint $table) {
            $table->uuid('id')->primary(); // UUIDv7 sebagai primary key utama
            
            // Kolom Kode Unik Tambahan (misal nomor referensi/kode unik data)
            $table->string('code')->unique(); 
            
            // Kolom Type: pilihan krosok atau precut
            $table->enum('type', ['krosok', 'precut'])->default('krosok');
            
            // Informasi Header Dokumen
            $table->string('form_number')->default('F.EXC -39 C/2026');
            $table->date('document_date')->nullable();
            
            // Informasi Baris Detail (Berdasarkan Gambar)
            $table->integer('item_no'); // Kolom No (1, 2, dst)
            $table->string('gdg', 50); // Kolom GDG (Contoh: J4)
            $table->string('jenis_tembakau', 50); // Kolom JENIS TEMBAKAU (Contoh: CHN)
            $table->year('tahun'); // Kolom THN (Contoh: 24 / 2024)
            $table->string('s_k', 50); // Kolom S - K (Contoh: 08 PS 26)
            $table->string('grade', 50); // Kolom GRADE (Contoh: M1F, BCF)
            $table->decimal('rencana', 12, 2); // Kolom RENCANA (Contoh: 1.000,0 atau 3.000,0)

            // Kolom Audit bawaan BaseModel / Blameable
            $table->uuid('created_by')->nullable();
            $table->uuid('updated_by')->nullable();
            $table->uuid('deleted_by')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rnd_tobacco_aturan');
    }
};