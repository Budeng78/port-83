<?php

namespace Modules\Platform\RBAC\Models;

use App\Models\BaseModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrganizationUnit extends BaseModel
{
    protected $table = 'organization_units';

    protected $fillable = [
        'parent_id',
        'code',
        'name',
        'type',
        'description',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    /*
    |--------------------------------------------------------------------------
    | Parent
    |--------------------------------------------------------------------------
    */

    public function parent(): BelongsTo
    {
        return $this->belongsTo(
            OrganizationUnit::class,
            'parent_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Children
    |--------------------------------------------------------------------------
    */

    public function children(): HasMany
    {
        return $this->hasMany(
            OrganizationUnit::class,
            'parent_id'
        )->orderBy('sort_order');
    }

    /*
    |--------------------------------------------------------------------------
    | User Assignments
    |--------------------------------------------------------------------------
    */

    public function assignments(): HasMany
    {
        return $this->hasMany(
            UserAssignment::class,
            'organization_unit_id'
        );
    }
}