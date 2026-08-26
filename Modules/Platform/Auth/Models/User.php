<?php

namespace Modules\Platform\Auth\Models;

use App\Models\BaseModel;
use Illuminate\Auth\Authenticatable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Modules\Platform\RBAC\Models\UserAssignment;
use Modules\Platform\System\Models\UserMenu;
use Spatie\Permission\Traits\HasRoles;


class User extends BaseModel implements AuthenticatableContract
{
    use HasApiTokens;
    use Notifiable;
    use Authenticatable;
    use HasRoles;

    protected $table = 'users';

    protected $fillable = [
        'name',
        'email',
        'password',
        'no_whatsapp',
        'created_by',
        'updated_by',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }


    /*
    |--------------------------------------------------------------------------
    | ASSIGNMENTS
    |--------------------------------------------------------------------------
    |
    | Seluruh assignment milik user.
    |
    | 1 User
    | ├── Primary
    | ├── Secondary
    | └── Secondary
    |
    */

    public function assignments(): HasMany
    {
        return $this->hasMany(
            UserAssignment::class,
            'user_id'
        );
    }


    /*
    |--------------------------------------------------------------------------
    | PRIMARY ASSIGNMENT
    |--------------------------------------------------------------------------
    |
    | Satu user hanya mempunyai satu assignment utama.
    |
    */

    public function primaryAssignment(): HasOne
    {
        return $this->hasOne(
            UserAssignment::class,
            'user_id'
        )->where('is_primary', true);
    }


    /*
    |--------------------------------------------------------------------------
    | ACTIVE ASSIGNMENTS
    |--------------------------------------------------------------------------
    |
    | Seluruh assignment aktif milik user.
    |
    */

    public function activeAssignments(): HasMany
    {
        return $this->hasMany(
            UserAssignment::class,
            'user_id'
        )->where('is_active', true);
    }

    public function userMenus(): HasMany
    {
        return $this->hasMany(
            UserMenu::class,
            'user_id'
        );
    }


}