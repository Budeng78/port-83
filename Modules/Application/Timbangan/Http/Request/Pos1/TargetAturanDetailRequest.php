<?php

namespace Modules\Application\Timbangan\Http\Request\Pos1;

use Illuminate\Foundation\Http\FormRequest;

class TargetAturanDetailRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'target_aturan_id' => [
                'required',
                'uuid',
                'exists:timbangan_pos1_target_aturan,id',
            ],

            'type' => [
                'required',
                'in:krosok,precut',
            ],

            'jenis_tbk' => [
                'required',
                'string',
                'max:100',
            ],

            'tahun' => [
                'required',
                'string',
                'max:20',
            ],

            'grade' => [
                'required',
                'string',
                'max:100',
            ],

            's_k' => [
                'required',
                'string',
                'max:10',
            ],

            'jumlah_bal' => [
                'required',
                'integer',
            ],
            
            'berat_bruto' => [
                'required',
                'numeric',
            ],

            'tara' => [
                'required',
                'numeric',
            ],
        ];
    }
}