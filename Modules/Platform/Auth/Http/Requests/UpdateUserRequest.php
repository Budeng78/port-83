<?php

namespace Modules\Platform\Auth\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $user = $this->route('user');
        $userId = $user?->getKey();

        return [
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'email' => [
                'sometimes',
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],

            'no_whatsapp' => [
                'nullable',
                'string',
                'max:20',
                Rule::unique('users', 'no_whatsapp')->ignore($userId),
            ],

            'password' => [
                'sometimes',
                'nullable',
                'string',
                'min:8',
            ],
        ];
    }
}