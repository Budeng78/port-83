<?php

namespace Modules\Application\Timbangan\Http\Request\Pos1;

use Illuminate\Foundation\Http\FormRequest;

class Pos1TargetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tanggal'      => ['required', 'date'],
            'nomor_aturan' => ['required', 'string', 'max:100'],
            'jenis_tbk'    => ['required', 'string', 'max:100'],
            's_k'          => ['required', 'string', 'max:10'],
            'jumlah_bal'   => ['required', 'integer', 'min:1'],
        ];
    }
}
