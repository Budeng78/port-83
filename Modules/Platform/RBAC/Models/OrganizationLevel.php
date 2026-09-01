<?php

namespace Modules\Platform\RBAC\Models;

use App\Models\BaseModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrganizationLevel extends BaseModel
{
    protected $table = 'organization_levels';

    protected $fillable = [
        'parent_id',
        'code',
        'name',
        'description',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(
            OrganizationLevel::class,
            'parent_id'
        );
    }

    public function children(): HasMany
    {
        return $this->hasMany(
            OrganizationLevel::class,
            'parent_id'
        )->orderBy('sort_order');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(
            UserAssignment::class,
            'organization_level_id'
        );
    }
}