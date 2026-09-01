<?php

namespace App\Traits;

trait Searchable
{
    /**
     * Scope untuk pencarian data berdasarkan keyword pada kolom tertentu.
     */
    public function scopeSearch($query, ?string $keyword, array $columns = [])
    {
        if (empty($keyword) || empty($columns)) {
            return $query;
        }

        return $query->where(function ($q) use ($keyword, $columns) {
            foreach ($columns as $column) {
                $q->orWhere($column, 'LIKE', '%' . $keyword . '%');
            }
        });
    }
}