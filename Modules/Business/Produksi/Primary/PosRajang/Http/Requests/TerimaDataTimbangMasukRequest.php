<?php

namespace Modules\Business\Produksi\Primary\PosRajang\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TerimaDataTimbangMasukRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Payload dari Node-RED berupa angka mentah.
     *
     * Contoh:
     * 46
     */
    protected function prepareForValidation(): void
    {
        $payload = trim($this->getContent());

        $this->merge([
            'berat' => is_numeric($payload)
                ? (float) $payload
                : $payload,
        ]);
    }

    public function rules(): array
    {
        return [
            'berat' => [
                'required',
                'numeric',
                'min:0',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'berat.required' => 'Payload timbangan wajib diisi.',
            'berat.numeric' => 'Payload timbangan harus berupa angka.',
            'berat.min' => 'Berat timbangan tidak boleh negatif.',
        ];
    }

    public function berat(): float
    {
        return (float) $this->validated('berat');
    }
}