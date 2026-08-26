<?php

namespace Modules\Platform\System\Models;

use App\Models\BaseModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Menu extends BaseModel
{
    protected $table = 'menus';

    protected $fillable = [
        'parent_id',
        'label',
        'path',
        'icon',

        // Access Control
        'organization_unit_name',
        'permission_key',

        'order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'order' => 'integer',
        ];
    }

    /**
     * Relasi ke parent menu (menu induk).
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(
            Menu::class,
            'parent_id'
        );
    }

    /**
     * Relasi ke children menu (sub-menu / anak).
     */
    public function children(): HasMany
    {
        return $this->hasMany(
            Menu::class,
            'parent_id'
        )->orderBy('order', 'asc');
    }

    /**
     * Relasi ke assignment menu milik user.
     */
    public function userMenus(): HasMany
    {
        return $this->hasMany(
            UserMenu::class,
            'menu_id'
        );
    }
}