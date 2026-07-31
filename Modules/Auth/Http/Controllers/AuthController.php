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
        $request->validate([
            'no_whatsapp' => 'required|string', 
            'password' => 'required|string',
        ]);

        $identity = $request->no_whatsapp;

        $field = filter_var($identity, FILTER_VALIDATE_EMAIL) ? 'email' : 'no_whatsapp';

        $user = User::where($field, $identity)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'no_whatsapp' => ['Email/Nomor WhatsApp atau password yang diberikan salah.'],
            ]);
        }

        if (isset($user->status) && $user->status === 'pending') {
            return response()->json([
                'message' => 'Akun Anda masih dalam status pending/menunggu persetujuan atasan.'
            ], 403);
        }

        // Cek status aktif user jika ada kolom is_active
        if (isset($user->is_active) && $user->is_active === false) {
            return response()->json([
                'message' => 'Akun Anda telah dinonaktifkan.'
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        $agreementRequired = false; 
        $latestTerm = null;

        // Ubah user menjadi array dan sisipkan extra_permissions
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