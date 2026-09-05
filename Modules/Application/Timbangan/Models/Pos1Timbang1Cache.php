<?php

namespace Modules\Application\Timbangan\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Pos1Timbang1Cache extends Model
{
    protected $table = 'timbangan_pos1_timbang1_cache';

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'target_id',
        'nomor_bal',
        'berat_kotor',
    ];

    protected $casts = [
        'nomor_bal'   => 'integer',
        'berat_kotor' => 'decimal:3',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    public function target()
    {
        return $this->belongsTo(Pos1Target::class, 'target_id');
    }
}