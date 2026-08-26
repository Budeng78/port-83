<?php

namespace Modules\Platform\RBAC\Models;

use App\Models\BaseModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Platform\Auth\Models\User;
use Modules\Platform\RBAC\Models\OrganizationUnit;
use Modules\Platform\RBAC\Models\OrganizationLevel;

class UserAssignment extends BaseModel
{
    protected $table = 'user_assignments';

    protected $fillable = [
        'user_id',
        'organization_unit_id',
        'organization_level_id',
        'is_primary',
        'starts_at',
        'ends_at',
        'is_active',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'is_active' => 'boolean',
        'starts_at' => 'date',
        'ends_at' => 'date',
    ];

    /*
    |--------------------------------------------------------------------------
    | USER
    |--------------------------------------------------------------------------
    */

    public function user(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'user_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | ORGANIZATION UNIT
    |--------------------------------------------------------------------------
    */

    public function organizationUnit(): BelongsTo
    {
        return $this->belongsTo(
            OrganizationUnit::class,
            'organization_unit_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | ORGANIZATION LEVEL
    |--------------------------------------------------------------------------
    */

    public function organizationLevel(): BelongsTo
    {
        return $this->belongsTo(
            OrganizationLevel::class,
            'organization_level_id'
        );
    }
}