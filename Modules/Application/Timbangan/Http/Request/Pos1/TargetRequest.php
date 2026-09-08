<?php

namespace Modules\Application\Timbangan\Http\Request\Pos1;

use Illuminate\Foundation\Http\FormRequest;

class TargetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'kode_batch' => [
                'required',
                'string',
                'max:30',
            ],

            'tanggal' => [
                'required',
                'date',
            ],

            'status' => [
                'nullable',
                'in:pending,active,finish',
            ],
        ];
    }
}