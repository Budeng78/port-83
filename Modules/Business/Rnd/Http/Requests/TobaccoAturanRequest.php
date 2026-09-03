<?php
namespace Modules\Business\Rnd\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TobaccoAturanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isUpdate = $this->isMethod('put') || $this->isMethod('patch');
        $id = $this->route('tobacco_aturan'); 

        return [
            'code' => [
                $isUpdate ? 'sometimes' : 'required', 
                'string', 
                'unique:rnd_tobacco_aturan,code' . ($isUpdate ? ',' . $id . ',id' : '')
            ],
            'type' => [$isUpdate ? 'sometimes' : 'required', 'in:krosok,precut'],
            'form_number' => [$isUpdate ? 'sometimes' : 'required', 'string'],
            'document_date' => ['nullable', 'date'],
            'item_no' => [$isUpdate ? 'sometimes' : 'required', 'integer'],
            'gdg' => [$isUpdate ? 'sometimes' : 'required', 'string', 'max:50'],
            'jenis_tembakau' => [$isUpdate ? 'sometimes' : 'required', 'string', 'max:50'],
            'tahun' => [$isUpdate ? 'sometimes' : 'required', 'integer'],
            's_k' => [$isUpdate ? 'sometimes' : 'required', 'string', 'max:50'],
            'grade' => [$isUpdate ? 'sometimes' : 'required', 'string', 'max:50'],
            'rencana' => [$isUpdate ? 'sometimes' : 'required', 'numeric'],
        ];
    }

    /**
     * Kustomisasi pesan error validasi dalam bahasa Indonesia.
     */
    public function messages(): array
    {
        return [
            'code.required' => 'Kode wajib diisi.',
            'code.unique' => 'Kode ini sudah terdaftar, gunakan kode lain.',
            'type.required' => 'Tipe tembakau wajib dipilih.',
            'type.in' => 'Tipe harus bernilai krosok atau precut.',
            'form_number.required' => 'Nomor form wajib diisi.',
            'document_date.date' => 'Format tanggal dokumen tidak valid.',
            'item_no.required' => 'Nomor item wajib diisi.',
            'item_no.integer' => 'Nomor item harus berupa angka.',
            'gdg.required' => 'Gudang (GDG) wajib diisi.',
            'jenis_tembakau.required' => 'Jenis tembakau wajib diisi.',
            'tahun.required' => 'Tahun wajib diisi.',
            'tahun.integer' => 'Tahun harus berupa angka.',
            's_k.required' => 'Kolom S-K wajib diisi.',
            'grade.required' => 'Grade wajib diisi.',
            'rencana.required' => 'Nilai rencana wajib diisi.',
            'rencana.numeric' => 'Nilai rencana harus berupa angka.',
        ];
    }
}