<?php

namespace Modules\Platform\Auth\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Modules\Platform\Auth\Models\User;

class UserService
{
    /**
     * =====================================================
     * GET USERS
     * =====================================================
     *
     * Mengambil daftar user dengan pagination dan pencarian.
     */
    public function getUsers(
        ?string $search = null,
        int $perPage = 10
    ): LengthAwarePaginator {
        $query = User::query()
            ->select([
                'id',
                'name',
                'email',
                'no_whatsapp',
                'email_verified_at',
                'created_at',
                'updated_at',
            ]);

        /*
        |--------------------------------------------------------------------------
        | SEARCH
        |--------------------------------------------------------------------------
        */

        if ($search !== null && trim($search) !== '') {
            $keyword = trim($search);

            $query->where(function ($q) use ($keyword) {
                $q->where('name', 'like', "%{$keyword}%")
                    ->orWhere('email', 'like', "%{$keyword}%")
                    ->orWhere('no_whatsapp', 'like', "%{$keyword}%");
            });
        }

        /*
        |--------------------------------------------------------------------------
        | ORDER
        |--------------------------------------------------------------------------
        */

        $query->orderBy('name');

        /*
        |--------------------------------------------------------------------------
        | PAGINATION
        |--------------------------------------------------------------------------
        */

        return $query->paginate(
            max(1, min($perPage, 100))
        );
    }


    /**
     * =====================================================
     * GET SINGLE USER
     * =====================================================
     */
    public function getUser(User $user): User
    {
        return $user;
    }


    /**
     * =====================================================
     * CREATE USER
     * =====================================================
     */
    public function createUser(array $data): User
    {
        return DB::transaction(function () use ($data) {

            /*
            |--------------------------------------------------------------------------
            | NORMALISASI DATA
            |--------------------------------------------------------------------------
            */

            $data['name'] = trim($data['name']);
            $data['email'] = strtolower(trim($data['email']));

            if (
                array_key_exists('no_whatsapp', $data)
                && $data['no_whatsapp'] !== null
            ) {
                $data['no_whatsapp'] = trim($data['no_whatsapp']);

                if ($data['no_whatsapp'] === '') {
                    $data['no_whatsapp'] = null;
                }
            }

            /*
            |--------------------------------------------------------------------------
            | CREATE
            |--------------------------------------------------------------------------
            |
            | Password akan otomatis di-hash oleh cast:
            |
            | 'password' => 'hashed'
            |
            | pada User model.
            |
            */

            $user = User::create($data);

            return $user->fresh();
        });
    }


    /**
     * =====================================================
     * UPDATE USER
     * =====================================================
     */
    public function updateUser(
        User $user,
        array $data
    ): User {
        return DB::transaction(function () use ($user, $data) {

            /*
            |--------------------------------------------------------------------------
            | NORMALISASI DATA
            |--------------------------------------------------------------------------
            */

            if (array_key_exists('name', $data)) {
                $data['name'] = trim($data['name']);
            }

            if (array_key_exists('email', $data)) {
                $data['email'] = strtolower(trim($data['email']));
            }

            if (
                array_key_exists('no_whatsapp', $data)
                && $data['no_whatsapp'] !== null
            ) {
                $data['no_whatsapp'] = trim($data['no_whatsapp']);

                if ($data['no_whatsapp'] === '') {
                    $data['no_whatsapp'] = null;
                }
            }

            /*
            |--------------------------------------------------------------------------
            | PASSWORD
            |--------------------------------------------------------------------------
            |
            | Jika password kosong/null pada update,
            | jangan mengubah password lama.
            |
            */

            if (
                array_key_exists('password', $data)
                && (
                    $data['password'] === null
                    || $data['password'] === ''
                )
            ) {
                unset($data['password']);
            }

            /*
            |--------------------------------------------------------------------------
            | UPDATE
            |--------------------------------------------------------------------------
            */

            $user->update($data);

            return $user->fresh();
        });
    }


    /**
     * =====================================================
     * DELETE USER
     * =====================================================
     */
    public function deleteUser(User $user): void
    {
        DB::transaction(function () use ($user) {
            $user->delete();
        });
    }
}