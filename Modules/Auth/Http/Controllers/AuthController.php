<?php

namespace Modules\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use Modules\Auth\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Proses Login API menggunakan Sanctum (Mendukung Email atau No WhatsApp).
     */
    public function login(Request $request)
    {
        // Validasi fleksibel: tidak membatasi nama field dari frontend, asal password wajib diisi
        $request->validate([
            'password' => 'required|string',
        ]);

        // Tangkap input dari field apa saja yang dikirim oleh form React
        $identity = $request->input('email') 
            ?? $request->input('no_whatsapp') 
            ?? $request->input('identity')
            ?? $request->input('username');

        if (! $identity) {
            throw ValidationException::withMessages([
                'email' => ['Kolom Email atau Nomor WhatsApp wajib diisi.'],
            ]);
        }

        // Deteksi otomatis apakah input berupa email atau nomor WhatsApp
        $field = filter_var($identity, FILTER_VALIDATE_EMAIL) ? 'email' : 'no_whatsapp';

        $user = User::where($field, $identity)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email/Nomor WhatsApp atau password yang diberikan salah.'],
            ]);
        }

        if (isset($user->status) && $user->status === 'pending') {
            return response()->json([
                'message' => 'Akun Anda masih dalam status pending/menunggu persetujuan atasan.'
            ], 403);
        }

        if (isset($user->is_active) && $user->is_active === false) {
            return response()->json([
                'message' => 'Akun Anda telah dinonaktifkan.'
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        $agreementRequired = false; 
        $latestTerm = null;

        $userData = $user->toArray();
        $userData['extra_permissions'] = method_exists($user, 'getAllPermissions') 
            ? $user->getAllPermissions()->pluck('name') 
            : [];

        return response()->json([
            'status' => 'success',
            'message' => 'Login berhasil',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'agreement_required' => $agreementRequired,
            'latest_term' => $latestTerm,
            'user' => $userData
        ]);
    }

    /**
     * Proses Logout (Menghapus token yang sedang aktif).
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Logout berhasil'
        ]);
    }

    /**
     * Mendapatkan informasi user yang sedang login.
     */
    public function me(Request $request)
    {
        $user = $request->user();

        // Pastikan endpoint /me juga menyertakan extra_permissions
        $userData = $user->toArray();
        $userData['extra_permissions'] = method_exists($user, 'getAllPermissions') 
            ? $user->getAllPermissions()->pluck('name') 
            : [];

        return response()->json([
            'status' => 'success',
            'data' => $userData
        ]);
    }
}