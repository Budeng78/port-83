<?php

namespace Modules\Application\Timbangan\Http\Request\Pos1;

use Illuminate\Foundation\Http\FormRequest;

class TargetAturanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'target_id' => [
                'required',
                'uuid',
                'exists:timbangan_pos1_target,id',
            ],

            'nomor_aturan' => [
                'required',
                'string',
                'max:100',
            ],
        ];
    }
}