<?php

namespace Modules\Auth\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Modules\Auth\Models\User;

class UserService
{
    /**
     * =====================================================
     * GET LIST USER
     * =====================================================
     */
    public function getUsers(
        ?string $search = null,
        int $perPage = 10
    ): LengthAwarePaginator {

        $query = User::query();

        if ($search !== null && trim($search) !== '') {

            $search = trim($search);

            $query->where(function ($q) use ($search) {

                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('no_whatsapp', 'like', "%{$search}%");

            });
        }

        return $query
            ->latest()
            ->paginate($perPage);
    }


    /**
     * =====================================================
     * GET DETAIL USER
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