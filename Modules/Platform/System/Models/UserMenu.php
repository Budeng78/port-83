<?php

namespace Modules\Platform\System\Models;

use App\Models\BaseModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Platform\Auth\Models\User;
use Modules\Platform\Dashboard\Models\Menu;

class UserMenu extends BaseModel
{
    protected $table = 'user_menu';

    protected $fillable = [
        'user_id',
        'menu_id',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | USER
    |--------------------------------------------------------------------------
    |
    | User yang mendapatkan assignment menu ini.
    |
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
    | MENU
    |--------------------------------------------------------------------------
    |
    | Menu yang diberikan kepada user.
    |
    */

    public function menu(): BelongsTo
    {
        return $this->belongsTo(
            Menu::class,
            'menu_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | CREATED BY
    |--------------------------------------------------------------------------
    |
    | User yang membuat assignment menu.
    |
    */

    public function creator(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'created_by'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATED BY
    |--------------------------------------------------------------------------
    |
    | User yang terakhir mengubah assignment menu.
    |
    */

    public function updater(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'updated_by'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | DELETED BY
    |--------------------------------------------------------------------------
    |
    | User yang menghapus assignment menu.
    |
    */

    public function deleter(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'deleted_by'
        );
    }
}