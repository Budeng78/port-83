<?php

namespace Modules\Business\Rnd\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RndAturanTbkKirimanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'no_surat_kiriman' => [
                'required',
                'string',
                'max:100',
            ],

            'nomor_kendaraan' => [
                'required',
                'string',
                'max:50',
            ],

            'nama_sopir' => [
                'required',
                'string',
                'max:100',
            ],

            'dari' => [
                'required',
                'string',
                'max:100',
            ],

            'details' => [
                'required',
                'array',
                'min:1',
            ],

            'details.*.aturan_detail_id' => [
                'required',
                'uuid',
                'exists:primary_rnd_aturan_tbk_detail,id',
            ],

            'details.*.type' => [
                'required',
                'string',
                'max:20',
            ],

            'details.*.jumlah_pack' => [
                'required',
                'integer',
                'min:1',
            ],

            'details.*.tara' => [
                'required',
                'numeric',
                'min:0',
            ],
        ];
    }
}