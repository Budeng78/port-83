<?php

namespace App\Models;

use App\Traits\Blameable;

use App\Traits\Searchable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

abstract class BaseModel extends Model
{
    use HasUuids, Blameable, Searchable, SoftDeletes, LogsActivity;

    /**
     * Konfigurasi standar untuk Spatie Activity Log (Audit Trail ISO 27001).
     */
   public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontLogEmptyChanges() // Diubah dari dontSubmitEmptyLogs()
            ->useLogName(strtolower(class_basename(static::class)));
    }

    /**
     * Booting global untuk seluruh model turunan.
     */
    protected static function booted()
    {
        parent::booted();

        // Mengaktifkan strict mode Laravel untuk mencegah lazy loading & mass assignment error
        static::shouldBeStrict(! app()->isProduction());
    }
}