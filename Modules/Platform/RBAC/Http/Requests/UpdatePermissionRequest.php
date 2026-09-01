<?php

namespace Modules\Platform\RBAC\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Permission;

class UpdatePermissionRequest extends FormRequest
{
    /**
     * Permission untuk menjalankan request.
     */
    public function authorize(): bool
    {
        return true;
    }


    /**
     * Aturan validasi.
     */
    public function rules(): array
    {
        /** @var Permission|null $permission */
        $permission = $this->route('permission');

        $permissionId = $permission?->id;


        return [
            'name' => [
                'required',
                'string',
                'max:255',

                'regex:/^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/',

                Rule::unique('permissions', 'name')
                    ->ignore($permissionId)
                    ->where(function ($query) {
                        return $query->where(
                            'guard_name',
                            $this->input('guard_name', 'web')
                        );
                    }),
            ],

            'guard_name' => [
                'nullable',
                'string',
                'max:255',
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

            'guard_name.string' =>
                'Guard name harus berupa teks.',

            'guard_name.max' =>
                'Guard name maksimal 255 karakter.',
        ];
    }


    /**
     * Normalisasi input sebelum validasi.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => is_string($this->name)
                ? trim($this->name)
                : $this->name,

            'guard_name' => $this->filled('guard_name')
                ? trim($this->guard_name)
                : null,
        ]);
    }
}

