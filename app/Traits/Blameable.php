<?php

namespace App\Traits;

use Illuminate\Support\Facades\Auth;

trait Blameable
{
    /**
     * Booting event untuk mencatat siapa yang membuat dan mengubah data.
     */
    protected static function bootBlameable()
    {
        static::creating(function ($model) {
            if (Auth::check()) {
                $userId = Auth::id();
                
                if (in_array('created_by', $model->getFillable()) && empty($model->created_by)) {
                    $model->created_by = $userId;
                }
                
                if (in_array('updated_by', $model->getFillable()) && empty($model->updated_by)) {
                    $model->updated_by = $userId;
                }
            }
        });

        static::updating(function ($model) {
            if (Auth::check()) {
                if (in_array('updated_by', $model->getFillable())) {
                    $model->updated_by = Auth::id();
                }
            }
        });
    }
}