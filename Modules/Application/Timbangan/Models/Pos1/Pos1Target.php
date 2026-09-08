<?php


namespace Modules\Application\Timbangan\Models\Pos1;

use App\Models\BaseModel;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class Pos1Target extends BaseModel
{
    protected $table = 'timbangan_pos1_target';

    protected $fillable = [
        'kode_batch',
        'tanggal',
        'nomor_aturan',
        'type',
        'jenis_tbk',
        'tahun',
        'grade',
        's_k',
        'jumlah_bal',
        'tara',
        'status',
    ];

    protected $casts = [
        'tanggal'    => 'date',
        'jumlah_bal' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->kode_batch)) {
                // Pass tanggal dari inputan model agar prefix sesuai bulan transaksi
                $model->kode_batch = static::generateKodeBatch($model->tanggal);
            }
        });
    }

    /**
     * Generate kode batch dengan format: BTC-YYMM-0001
     * Nomor urut reset setiap bulan, dikunci (lockForUpdate)
     * supaya aman dari race condition saat 2 request bersamaan.
     */
    public static function generateKodeBatch($tanggal = null): string
    {
        $date = $tanggal ? Carbon::parse($tanggal) : now();
        $prefix = 'BTC-' . $date->format('ym') . '-';

        return DB::transaction(function () use ($prefix) {
            // Filter berdasarkan prefix bulan transaksi & urutkan berdasarkan ID/created_at
            $lastKode = static::withTrashed()
                ->where('kode_batch', 'like', $prefix . '%')
                ->lockForUpdate()
                ->orderByDesc('id') // Gunakan id/created_at agar urutan numerik data terbaru selalu valid
                ->value('kode_batch');

            $lastNumber = $lastKode
                ? (int) substr($lastKode, strlen($prefix)) // Mengambil angka setelah prefix secara dinamis
                : 0;

            $nextNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);

            return $prefix . $nextNumber;
        });
    }

    public function cache()
    {
        return $this->hasMany(
            Pos1Timbang1Cache::class,
            'target_id'
        );
    }

    public function timbang1()
    {
        return $this->hasMany(
            Pos1Timbang1::class,
            'target_id'
        );
    }
}