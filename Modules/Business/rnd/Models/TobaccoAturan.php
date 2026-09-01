<?php
namespace Modules\Business\rnd\Models;

use App\Models\BaseModel;

class TobaccoAturan extends BaseModel
{
    protected $table = 'rnd_tobacco_aturan';

    protected $fillable = [
        'code',
        'type',
        'form_number',
        'document_date',
        'item_no',
        'gdg',
        'jenis_tembakau',
        'tahun',
        's_k',
        'grade',
        'rencana',
    ];

    protected $casts = [
        'document_date' => 'date',
        'rencana' => 'decimal:2',
    ];
}