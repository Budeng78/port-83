<?php

namespace Modules\Business\Produksi\Primary\PosRajang\Models;

use App\Models\BaseModel;
use Illuminate\Database\Eloquent\SoftDeletes;

class PrimaryPos1RajangWo extends BaseModel
{
    use SoftDeletes;

    /*
    |--------------------------------------------------------------------------
    | TABLE
    |--------------------------------------------------------------------------
    */

    protected $table = 'primary_pos1_rajang_wo';


    /*
    |--------------------------------------------------------------------------
    | FILLABLE
    |--------------------------------------------------------------------------
    */

    protected $fillable = [
        'tanggal_wo',
        'no_wo',
        'jenis',
        's_k',
        'jumlah_bal',
        'tara',
        'status',
        'keterangan',
    ];


    /*
    |--------------------------------------------------------------------------
    | CASTS
    |--------------------------------------------------------------------------
    */

    protected $casts = [
        'tanggal_wo' => 'date',
        'jumlah_bal' => 'integer',
        'tara'       => 'decimal:2',
    ];
}
