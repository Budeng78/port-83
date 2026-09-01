<?php

namespace Modules\Platform\RBAC\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Permission;

class PermissionRequest extends FormRequest
{
    /**
     * Semua user yang sudah melewati middleware auth
     * diperbolehkan menggunakan request ini.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Rules utama.
     */
    public function rules(): array
    {
        /*
        |--------------------------------------------------------------------------
        | Permission yang sedang diedit
        |--------------------------------------------------------------------------
        |
        | Digunakan ketika request dipanggil dari update().
        |
        */
        $permission = $this->route('permission');

        $permissionId = null;

        if ($permission instanceof Permission) {
            $permissionId = $permission->id;
        } elseif (is_numeric($permission)) {
            $permissionId = $permission;
        }

        $guardName = $this->input('guard_name', 'web');

        return [
            'name' => [
                'required',
                'string',
                'max:255',

                /*
                |--------------------------------------------------------------------------
                | Format permission
                |--------------------------------------------------------------------------
                |
                | Contoh valid:
                |
                | hrd.user.create
                | hrd.user.view
                | produksi.proses.view
                | produksi.proses.create
                |
                */
                'regex:/^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/',

                /*
                |--------------------------------------------------------------------------
                | Tidak boleh duplicate
                |--------------------------------------------------------------------------
                */
                Rule::unique('permissions', 'name')
                    ->ignore($permissionId)
                    ->where(function ($query) use ($guardName) {
                        return $query->where(
                            'guard_name',
                            $guardName
                        );
                    }),
            ],

            'guard_name' => [
                'nullable',
                'string',
                'max:255',
                Rule::in([
                    'web',
                    'api',
                ]),
            ],
        ];
    }

    /**
     * Pesan validasi.
     */
    public function messages(): array
    {
        return [
            'name.required' =>
                'Nama permission wajib diisi.',

            'name.string' =>
                'Nama permission harus berupa teks.',

            'name.max' =>
                'Nama permission maksimal 255 karakter.',

            'name.regex' =>
                'Format permission harus menggunakan domain.nama, contoh: hrd.user.create.',

            'name.unique' =>
                'Permission tersebut sudah ada.',

            'guard_name.in' =>
                'Guard name hanya boleh web atau api.',

            'guard_name.string' =>
                'Guard name harus berupa teks.',

            'guard_name.max' =>
                'Guard name maksimal 255 karakter.',
        ];
    }

    /**
     * Normalisasi data sebelum validasi.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => is_string($this->name)
                ? trim($this->name)
                : $this->name,

            'guard_name' => $this->guard_name
                ?: 'web',
        ]);
    }
}