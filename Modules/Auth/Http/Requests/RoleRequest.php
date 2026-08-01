<?php

namespace Modules\Auth\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Mendapatkan ID role saat proses update untuk pengecualian unique validation
        $roleId = $this->route('role')?->id ?? $this->route('role');

        return [
            'name' => 'required|string|max:255|unique:roles,name,' . $roleId,
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,name',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama peran (role) wajib diisi.',
            'name.unique' => 'Nama peran tersebut sudah terdaftar.',
            'permissions.*.exists' => 'Hak akses (permission) yang dipilih tidak valid.',
        ];
    }
}