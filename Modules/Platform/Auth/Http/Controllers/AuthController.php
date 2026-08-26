<?php

namespace Modules\Platform\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Modules\Platform\Auth\Http\Requests\LoginRequest;
use Modules\Platform\Auth\Models\User;

class AuthController extends Controller
{
    /**
     * Login menggunakan email atau nomor WhatsApp.
     */
    public function login(LoginRequest $request)
    {
        $identity = $request->validated('identity');

        $field = filter_var($identity, FILTER_VALIDATE_EMAIL)
            ? 'email'
            : 'no_whatsapp';

        $user = User::where($field, $identity)->first();

        if (
            ! $user ||
            ! Hash::check($request->validated('password'), $user->password)
        ) {
            throw ValidationException::withMessages([
                'identity' => [
                    'Email/Nomor WhatsApp atau password yang diberikan salah.'
                ],
            ]);
        }

        $token = $user
            ->createToken('auth_token')
            ->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Login berhasil',

            'access_token' => $token,
            'token_type' => 'Bearer',

            'user' => $user,
        ]);
    }

    /**
     * Logout token yang sedang digunakan.
     */
    public function logout(Request $request)
    {
        $token = $request->user()->currentAccessToken();

        if ($token) {
            $token->delete();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Logout berhasil',
        ]);
    }

    /**
     * Informasi user yang sedang login.
     */
    public function me(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'data' => $request->user(),
        ]);
    }
}