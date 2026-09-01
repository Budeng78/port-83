<?php

namespace Modules\Business\Produksi\Primary\PosRajang\Models;

use App\Models\BaseModel;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PrimaryPos1RajangDokumenTimbangAwal extends BaseModel
{
    protected $table = 'primary_pos1_rajang_dokumen_timbang_awal';

    protected $fillable = [
        'no',
        'no_wo',
        'jenis',
        's_k',
        'tara',
        'jumlah_bal',
        'status',
    ];

    protected $casts = [
        'no' => 'integer',
        'tara' => 'decimal:2',
        'jumlah_bal' => 'integer',
    ];

    /**
     * Detail hasil timbang final.
     */
    public function details(): HasMany
    {
        return $this->hasMany(
            PrimaryPos1RajangDokumenTimbangAwalDetail::class,
            'dokumen_timbang_awal_id'
        );
    }

    /**
     * Cache proses timbang berjalan.
     */
    public function detailCaches(): HasMany
    {
        return $this->hasMany(
            PrimaryPos1RajangDokumenTimbangAwalDetailCache::class,
            'dokumen_timbang_awal_id'
        );
    }
}