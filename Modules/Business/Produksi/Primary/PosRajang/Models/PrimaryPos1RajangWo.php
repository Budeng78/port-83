<?php

namespace Modules\Business\Produksi\Primary\PosRajang\Models;

use App\Models\BaseModel;

class PrimaryPos1RajangWo extends BaseModel
{
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
        'aturan',
        'jumlah_bal',
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
    ];


    /*
    |--------------------------------------------------------------------------
    | RELATIONSHIP
    |--------------------------------------------------------------------------
    |
    | 1 WO Header memiliki banyak WO Detail.
    |
    */

    public function details()
    {
        return $this->hasMany(
            PrimaryPos1RajangWoDetail::class,
            'wo_id'
        );
    }
}