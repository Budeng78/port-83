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
            'kode_batch'           => ['required', 'string', 'max:50'],
            'tanggal'              => ['required', 'date'],
            'status'               => ['sometimes', 'in:pending,active,finish'],
            
            // Array validation untuk multiple items
            'items'                => ['required', 'array', 'min:1'],
            'items.*.nomor_aturan' => ['required', 'string', 'max:100'],
            'items.*.jenis_tbk'    => ['required', 'string', 'max:100'],
            'items.*.tahun'        => ['required', 'string', 'max:20'],
            'items.*.grade'        => ['required', 'string', 'max:100'],
            'items.*.s_k'          => ['required', 'string', 'max:10'],
            'items.*.type'         => ['required', 'in:krosok,precut'],
            'items.*.jumlah_bal'   => ['required', 'integer', 'min:1'],
            'items.*.tara'         => ['required', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'items.required' => 'Minimal harus ada 1 item tembakau.',
            'items.*.nomor_aturan.required' => 'Nomor aturan wajib diisi.',
            'items.*.jenis_tbk.required' => 'Jenis tembakau wajib diisi.',
            'items.*.tahun.required' => 'Tahun wajib diisi.',
            'items.*.type.in' => 'Type hanya boleh krosok atau precut.',
            'items.*.jumlah_bal.min' => 'Jumlah bal minimal 1.',
            'items.*.tara.min' => 'Tara minimal 0.',
        ];
    }
}
