<?php

namespace Modules\Business\Produksi\Primary\PosRajang\Models;

use App\Models\BaseModel;

class PrimaryPos1RajangWoDetail extends BaseModel
{
    /*
    |--------------------------------------------------------------------------
    | TABLE
    |--------------------------------------------------------------------------
    */

    protected $table = 'primary_pos1_rajang_wo_detail';


    /*
    |--------------------------------------------------------------------------
    | FILLABLE
    |--------------------------------------------------------------------------
    */

    protected $fillable = [
        'wo_id',
        'no_urut',
        'gudang',
        'jenis_tbk',
        'tahun',
        's_k',
        'grade',
        'jml_bal',
        'tara',
        'bruto',
        'netto',
    ];


    /*
    |--------------------------------------------------------------------------
    | CASTS
    |--------------------------------------------------------------------------
    */

    protected $casts = [
        'no_urut' => 'integer',
        'tahun'   => 'integer',
        'jml_bal' => 'integer',

        'tara'    => 'decimal:2',
        'bruto'   => 'decimal:2',
        'netto'   => 'decimal:2',
    ];


    /*
    |--------------------------------------------------------------------------
    | RELATIONSHIP
    |--------------------------------------------------------------------------
    */

    public function wo()
    {
        return $this->belongsTo(
            PrimaryPos1RajangWo::class,
            'wo_id'
        );
    }
}