<?php

namespace Modules\Platform\Auth\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Platform\Auth\Http\Requests\StoreUserRequest;
use Modules\Platform\Auth\Http\Requests\UpdateUserRequest;
use Modules\Platform\Auth\Models\User;
use Modules\Platform\Auth\Services\UserService;

class UserController extends Controller
{
    public function __construct(
        protected UserService $userService
    ) {
    }


    /**
     * =====================================================
     * GET /api/users
     * =====================================================
     */
    public function index(Request $request): JsonResponse
    {
        $users = $this->userService->getUsers(
            search: $request->input('search'),
            perPage: (int) $request->input('per_page', 10)
        );

        return response()->json([
            'status' => 'success',
            'data' => $users,
        ]);
    }


    /**
     * =====================================================
     * POST /api/users
     * =====================================================
     */
    public function store(
        StoreUserRequest $request
    ): JsonResponse {

        $user = $this->userService->createUser(
            $request->validated()
        );

        return response()->json([
            'status' => 'success',
            'message' => 'User berhasil ditambahkan.',
            'data' => $user,
        ], 201);
    }


    /**
     * =====================================================
     * GET /api/users/{user}
     * =====================================================
     */
    public function show(User $user): JsonResponse
    {
        $user = $this->userService->getUser($user);

        return response()->json([
            'status' => 'success',
            'data' => $user,
        ]);
    }


    /**
     * =====================================================
     * PUT/PATCH /api/users/{user}
     * =====================================================
     */
    public function update(
        UpdateUserRequest $request,
        User $user
    ): JsonResponse {

        $user = $this->userService->updateUser(
            $user,
            $request->validated()
        );

        return response()->json([
            'status' => 'success',
            'message' => 'User berhasil diperbarui.',
            'data' => $user,
        ]);
    }


    /**
     * =====================================================
     * DELETE /api/users/{user}
     * =====================================================
     */
    public function destroy(User $user): JsonResponse
    {
        $this->userService->deleteUser($user);

        return response()->json([
            'status' => 'success',
            'message' => 'User berhasil dihapus.',
        ]);
    }
}