<?php

namespace Modules\Auth\Models; // Sesuaikan dengan namespace modul/app AndaModules/Auth/Models/Menu.php

use App\Models\BaseModel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Menu extends BaseModel
{
    use HasFactory;

    protected $table = 'menus';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'label',
        'path',
        'icon',
        'permission_name',
        'parent_id',
        'order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
    ];

    // Relasi ke Menu Induk (Parent)
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Menu::class, 'parent_id');
    }

    // Relasi ke Submenu (Children)
    public function children(): HasMany
    {
        return $this->hasMany(Menu::class, 'parent_id')->orderBy('order');
    }
}