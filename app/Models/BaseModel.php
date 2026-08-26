<?php

namespace App\Models;

use App\Traits\Blameable;
use App\Traits\Searchable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Modules\Platform\Auth\Models\User;

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
            ->dontLogEmptyChanges()
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

        // Global Event: Otomatis isi created_by saat data dibuat
        static::creating(function ($model) {
            if (Auth::check() && Schema::hasColumn($model->getTable(), 'created_by')) {
                $model->created_by = Auth::id();
            }
        });

        // Global Event: Otomatis isi updated_by saat data diubah
        static::updating(function ($model) {
            if (Auth::check() && Schema::hasColumn($model->getTable(), 'updated_by')) {
                $model->updated_by = Auth::id();
            }
        });

        // Global Event: Otomatis isi deleted_by saat model apa pun dihapus (Soft Delete)
        static::deleting(function ($model) {
            if (Auth::check() && Schema::hasColumn($model->getTable(), 'deleted_by')) {
                $model->deleted_by = Auth::id();
                $model->saveQuietly();
            }
        });
    }

    /**
     * Relasi Global: User yang membuat data
     */
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Relasi Global: User yang terakhir mengubah data
     */
    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Relasi Global: User yang menghapus data
     */
    public function deletedBy()
    {
        return $this->belongsTo(User::class, 'deleted_by');
    }
}